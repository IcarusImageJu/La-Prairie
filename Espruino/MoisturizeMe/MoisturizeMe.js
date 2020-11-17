//setInterval(function() {
  //console.log(analogRead(D35));
//}, 1000);

const CONTROLLER = {
  id:0,
  wifiSSid: 'BELL693',
  wifiPass: 'EF3A7CC4',
  mqttServer: '192.168.2.37',
  name: 'Controller test'
};

const MQTTConfig = {
  pubMoisturizersValues: 'MoisturizeMe/values',
  pubMoisturizersActions: 'MoisturizeMe/actions',
  subConfig: `MoisturizeMe/controllers/configs/${CONTROLLER.id}/#`,
  pubControllerStatus: `MoisturizeMe/controllers/states/${CONTROLLER.id}`,
};

const ssid = CONTROLLER.wifiSSid;
const password = CONTROLLER.wifiPass;

var mqtt = require("MQTT").connect({
  host: CONTROLLER.mqttServer,
});

let MQTTConnected = false;
let moisturizers = [];

mqtt.on("connected", function(){
  console.log('connected');
  moisturizers = [];
  mqtt.subscribe(MQTTConfig.subConfig);
  mqtt.publish(MQTTConfig.pubControllerStatus, '{"online": true}');
  MQTTConnected = true;
});

mqtt.on('publish', (pub) => {
  const topic = pub.topic;
  const message = pub.message;
  console.log("topic: "+topic);
  console.log("message: "+message);
  if(topic.includes('moisturizers/')) {
    const value = JSON.parse(message);
    const id = topic.split('/')[topic.split('/').length - 1];
    const moisturizer = {
      id: id,
      sensorPin: value[0],
      waterValue: Number(value[1]),
      airValue: Number(value[2]),
      minMoistRatio: Number(value[3]),
      valvePin: value[4],
      valveTimer: Number(value[5]),
      name: value[6],
      ratio: 0,
      lastWatering: new Date(),
    };
    moisturizers.push(moisturizer);
  }
});

mqtt.on('disconnected', function() {
  console.log("MQTT disconnected... reconnecting.");
  MQTTConnected = false;
  setTimeout(function() {
    mqtt.connect();
  }, 1000);
});

var wifi = require('Wifi');
wifi.connect(CONTROLLER.wifiSSid, {password: CONTROLLER.wifiPass}, function() {
    mqtt.connect();
    console.log('Connected to Wifi.  IP address is:', wifi.getIP().ip);
    // wifi.save(); // Next reboot will auto-connect
});

const interval = 5 * 60 * 1000;

setInterval(function() {
  moisturizers.forEach((moisturizer, i) => {
    const sensorPin = new Pin(`D${moisturizer.sensorPin}`);
    let acc = 0;
    const moy = 3;
    let n = 0;
    while (n < moy) {
      const value = analogRead(sensorPin) * 100;
      acc += 100 - (((value - moisturizer.waterValue) / (moisturizer.airValue - moisturizer.waterValue)) * 100);
      n++;
    }
    const ratio = acc / moy;
    const delta = 3;
    const shouldUpdateRatio = (ratio > (moisturizers[i].ratio + delta)) || (ratio < (moisturizers[i].ratio - delta));
    if(shouldUpdateRatio) {
      moisturizers[i].ratio = ratio;
      if(MQTTConnected) {
        mqtt.publish(`${MQTTConfig.pubMoisturizersValues}/${moisturizer.id}`, ratio);
      }
    }
    const shouldWater = ratio > moisturizer.minMoistRatio;
    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const lastWateringHour = moisturizer.lastWatering.getHours();
    const canWater = currentHour > lastWateringHour;
    if(shouldWater && canWater) {
      moisturizers[i].lastWatering = currentDate;
      const valvePin = new Pin(`D${moisturizer.valvePin}`);
      valvePin.set();
      setTimeout(() => valvePin.reset, moisturizer.valveTimer);
      if(MQTTConnected) {
        mqtt.publish(`${MQTTConfig.pubMoisturizersActions}/${moisturizer.id}`, 'Moisturized');
      }
    }
  });
}, interval);
