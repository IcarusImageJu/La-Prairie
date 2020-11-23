import ujson

moisturizers = []


class Moisturizer:
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
        self.sensorPin = sensorPin
        self.waterValue = waterValue
        self.airValue = airValue
        self.minMoistRatio = minMoistRatio
        self.valvePin = valvePin
        self.valveTimer = valveTimer
        self.name = name


def sub_cb(topic, msg):
    if b"moisturizers/" in topic:
        id = str(topic).split('/')[len(str(topic).split('/')) - 1].split("'")[0]
        o = ujson.loads(msg)
        moisturizer = Moisturizer(str(id), str(o[0]), str(0[1]), str(o[2]), str(o[3]), str(o[4]), str(o[5]), str(o[6]), str(o[7]))
        moisturizers.append(moisturizer)
        print(moisturizers)
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
    try:
        new_message = client.check_msg()
    except OSError as e:
        restart_and_reconnect()
