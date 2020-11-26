import ujson
import utime
from machine import Pin, ADC
import os

moisturizersConfigs = []
persisted = open("moisturizers.json")
try:
    persistedRead = ujson.loads(persisted.read())
except OSError as e:
    persistedRead = []


moisturizers = []


class Moisturizer:

    timeBetweenWatering = 1 * 60 * 60 * 1000
    timeBetweenTake = 5 * 60 * 1000
    sensorTake = 3
    minDelta = 2

    def __init__(
        self,
        id,
        sensorPin,
        waterValue,
        airValue,
        minMoistRatio,
        valvePin,
        valveTimer,
        name,
    ):
        self.id = id
        self.sensorPin = ADC(Pin(35))
        self.waterValue = waterValue
        self.airValue = airValue
        self.minMoistRatio = minMoistRatio
        self.valvePin = machine.Pin(valvePin)
        self.valveTimer = valveTimer
        self.name = name
        self.lastWatering = utime.ticks_ms()
        self.canWater = False
        self.askWater = False
        self.value = 0
        self.lastTake = 0
        self.timeTake = 0

    def readSensor(self):
        self.sensorPin.atten(ADC.ATTN_11DB)
        self.sensorPin.width(ADC.WIDTH_9BIT)
        acc = 0
        for i in range(self.sensorTake):
            acc += 100 - (
                (
                    (self.sensorPin.read() - self.waterValue)
                    / (self.airValue - self.waterValue)
                )
                * 100
            )
            time.sleep_ms(150)
        self.value = acc / self.sensorTake
        if self.lastTake == 0:
            self.lastTake = self.value

    def loop(self):
        canTake = False
        deltaTake = utime.ticks_add(self.timeTake, self.timeBetweenTake)
        if utime.ticks_diff(utime.ticks_ms(), deltaTake) > 0 or self.timeTake == 0:
            self.timeTake = utime.ticks_ms()
            canTake = True
        if canTake:
            self.readSensor()
            client.publish("MoisturizeMe/raw/" + self.id, str(self.value))
            if self.value < self.minMoistRatio:
                self.askWater = True
                client.publish(
                    "MoisturizeMe/askWater/" + self.id,
                    '{"minMoistRatio": '
                    + str(self.minMoistRatio)
                    + ', "value": '
                    + str(self.value)
                    + "}",
                )
            deltaTimer = utime.ticks_add(self.lastWatering, self.timeBetweenWatering)
            if utime.ticks_diff(utime.ticks_ms(), deltaTimer) > 0:
                self.canWater = True
            if self.askWater and self.canWater:
                time.sleep_ms(self.valveTimer)
                self.lastWatering = utime.ticks_ms()
                self.canWater = False
                client.publish(
                    "MoisturizeMe/watering/" + self.id,
                    '{"valveTimer": ' + str(self.valveTimer) + "}",
                )
            if (self.lastTake - self.value > self.minDelta) or (
                self.lastTake - self.value < -self.minDelta
            ):
                self.lastTake = self.value
                client.publish("MoisturizeMe/values/" + self.id, str(self.value))


if len(persistedRead) > 0:
    for o in persistedRead:
        moisturizer = Moisturizer(o[7], o[0], o[1], o[2], o[3], o[4], o[5], o[6])
        moisturizers.append(moisturizer)
        moisturizersConfigs.append(o)


def sub_cb(topic, msg):
    if b"moisturizers/" in topic:
        id = str(topic).split("/")[len(str(topic).split("/")) - 1].split("'")[0]
        o = ujson.loads(msg)
        o.append(id)
        moisturizer = Moisturizer(o[7], o[0], o[1], o[2], o[3], o[4], o[5], o[6])
        isNew = True
        for i in range(len(moisturizers)):
            if moisturizers[i].id == id:
                moisturizers[i] = moisturizer
                moisturizersConfigs[i] = o
                isNew = False
        if isNew:
            moisturizers.append(moisturizer)
            moisturizersConfigs.append(o)
        persistence = open("moisturizers.json", "w")
        ujson.dump(moisturizersConfigs, persistence)
    print((topic, msg))


def connect_and_subscribe():
    global client_id, mqtt_server, topic_sub
    client = MQTTClient(client_id, mqtt_server)
    client.set_callback(sub_cb)
    client.connect()
    client.subscribe(topic_sub)
    client.publish(topic_pub, b'{"online": true}')
    print(
        "Connected to %s MQTT broker, subscribed to %s topic" % (mqtt_server, topic_sub)
    )
    return client


def restart_and_reconnect():
    print("Failed to connect to MQTT broker. Reconnecting...")
    time.sleep(10)
    machine.reset()


try:
    client = connect_and_subscribe()
except OSError as e:
    restart_and_reconnect()

while True:
    for moisturizer in moisturizers:
        moisturizer.loop()
    try:
        new_message = client.check_msg()
    except OSError as e:
        restart_and_reconnect()
