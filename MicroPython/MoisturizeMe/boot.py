import time
from umqttsimple import MQTTClient
import ubinascii
import machine
import micropython
import network
import webrepl
import esp

esp.osdebug(None)
import gc

gc.collect()

ssid = "BELL693"
password = "EF3A7CC4"
mqtt_server = "192.168.2.37"
client_id = ubinascii.hexlify(machine.unique_id())
topic_sub = b"MoisturizeMe/controllers/configs/0/#"
topic_pub = b"MoisturizeMe/controllers/states/0"

station = network.WLAN(network.STA_IF)

station.active(True)
station.connect(ssid, password)

while station.isconnected() == False:
    pass

print("Connection successful")
print(station.ifconfig())
webrepl.start()
