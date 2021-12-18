const mqtt = require('mqtt');
const {Pool} = require('pg');
const {MongoClient} = require("mongodb");

const uri = "mongodb://localhost:27017/?maxPoolSize=20";

const clientMongoDb = new MongoClient(uri);

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    password: "root",
    database: "clase9",
    port: 5432
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

let client = mqtt.connect({
    host: "44.201.203.33",
    port: 1883,
    username: "",
    password: ""
});

client.on("connect", function () {
    console.log("conexión MQTT exitosa");
    client.subscribe("iot-platform/#"); // iot-platform/dev1/temperature-sensor    iot-platform/dev2/ligth-sensor
});

client.on("message", function (topic, messageData) {

    let message = JSON.parse(messageData.toString());

    console.log("topic: " + topic + " || messageData: " + message);

    let deviceId = topic.split("/")[1]; // iot-platform/dev1/temperature-sensor
    let deviceType = topic.split("/")[2];
    let value = message.temp;
    let timeCollect = message.timestamp; // hora a la que se recogió

    grabarSensorTempData(deviceId, deviceType, value, timeCollect)
    grabarSensorLigthData(deviceId2, deviceType2, value2) // TODO
});

function grabarSensorTempData(deviceId, deviceType, value, timeCollect) {
    let mongoDb = clientMongoDb.db("iot-database");
    let document = mongoDb.collection("temperature-sensor-ts");

    let fecha = new Date(); // fecha a la que se guardó
    let dataGuardar = {
        timestamp: fecha,
        metadata: {deviceId: deviceId, deviceType: deviceType, zonaHoraria: fecha.getTimezoneOffset()},
        temperature: value,
        fechaEnviada: timeCollect
    }

    clientMongoDb
        .connect()
        .then(function (result) {
            document.insertOne(dataGuardar, function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("documento guardado exitosamente, con id: " + res.insertedId);
                }
            });
        })
        .catch(function (err) {
            console.log(err);
        });
}
