var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var rpiDhtSensor = require('rpi-dht-sensor');

// here's a fake temperature sensor device that we'll expose to HomeKit
var DHT22_SENSOR = {
  dht: new rpiDhtSensor.DHT22(4),
  currentTemperature: 0,
  currentHumidity: 0,
  readSensorValues: function () {
    var readout = DHT22_SENSOR.dht.read();
    DHT22_SENSOR.currentTemperature = readout.temperature.toFixed(2);
    DHT22_SENSOR.currentHumidity = readout.humidity.toFixed(2);
  },
  getTemperature: function() {
    var temp = DHT22_SENSOR.currentTemperature;
    console.log("Getting the current temperature:", temp);
    return temp;
  },
  getHumidity: function () {
    var humidity = DHT22_SENSOR.currentHumidity;
    console.log("Getting the current humidity:", humidity);
    return humidity;
  }
};


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Temperature Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    // return our current temp value
    callback(null, DHT22_SENSOR.getTemperature());
  });

sensor
  .addService(Service.HumiditySensor)
  .getCharacteristic(Characteristic.CurrentRelativeHumidity)
  .on('get', function(callbak) {
    // return our current humidity value
    callbak(null, DHT22_SENSOR.getHumidity());
  });

// randomize our temperature reading every 3 seconds
setInterval(function() {

  //read values from sensor
  DHT22_SENSOR.readSensorValues();

  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, DHT22_SENSOR.getTemperature());

  sensor
    .getService(Service.HumiditySensor)
    .setCharacteristic(Characteristic.CurrentRelativeHumidity, DHT22_SENSOR.getHumidity());

}, 3000);
