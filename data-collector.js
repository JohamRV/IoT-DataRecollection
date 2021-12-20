//Abre conexión con mqtt
const mqtt = require('mqtt');
const {MongoClient} = require("mongodb");

//Url para poder conectarse con la base de datos, contiene su dirección IP y puerto para conectarse
const uri = "mongodb://3.95.224.80:27017/?maxPoolSize=20";
const clientMongoDb = new MongoClient(uri);
const PORT = 1883;
/* Lista de usuarios que tendrán acceso a la información que recolectan los sensores
username - password
mqttx - mqttx
ruth - ruth
samuel - samuel
pamela - pamela
katherine - katherine
joham - joham
*/

//Conexión del cliente por mqtt
let client = mqtt.connect({
    host: "44.201.203.33",
    port: PORT,
    username: "mqttx",
    password: "mqttx"
});


client.on("connect", function () {
    console.log("conexión MQTT exitosa sobre el puerto "  + PORT);
    client.subscribe("iot-platform/#"); // iot-platform/dev1/temperature-sensor    iot-platform/dev2/light-sensor
});

//Obtiene la información del JSON que tiene la información de la recolección de datos
client.on("message", function (topic, messageData) {

    let message = JSON.parse(messageData.toString());

    console.log("topic: " + topic + " || messageData: " + messageData.toString());

    let deviceId = topic.split("/")[1]; // iot-platform/dev1/temperature-sensor
    let deviceType = topic.split("/")[2];
    let value = 0
    let mensaje = ""
    let timeCollect = message.timestamp; // hora a la que se recogió
    if (deviceType === "light-sensor"){
        /*
        {
           "timestamp": "2021-12-18T21:49:41.883Z"
           "mensaje":"Se detectó presencia"
        }
        */

        if (message.mensaje === "Se detectó presencia" || message.mensaje === "No se detectó presencia" ){
            mensaje = message.mensaje
            grabarSensorLigthData(deviceId, deviceType, mensaje, timeCollect)
        }else{
            console.log(`El mensaje registrado por el dispsitivo ${deviceId} no es válido`)
        }

    }else if(deviceType === "temperature-sensor"){
        /*
        {
           "timestamp": "2021-12-18T21:49:41.883Z"
           "temp": 29
        }
        */

        if (!isNaN(message.temp)){
            value = message.temp;
            grabarSensorTempData(deviceId, deviceType, value, timeCollect)
        }else{
            console.log(`La temperatura registrada por el dispsitivo ${deviceId} no es válida`)
        }
    }else {
        console.log("El dispositivo no está asociado a la red")
    }

});


//Guardado de información del sensor de temperatura
function grabarSensorTempData(deviceId, deviceType, value, timeCollect) {
    let mongoDb = clientMongoDb.db("iot-database");
    let document = mongoDb.collection("temperature-sensor");

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

//Guardado de información del sensor de luz
function grabarSensorLigthData(deviceId, deviceType, mensaje, timeCollect) {
    let mongoDb = clientMongoDb.db("iot-database");
    let document = mongoDb.collection("light-sensor-ts");

    let fecha = new Date(); // fecha a la que se guardó
    let dataGuardar = {
        timestamp: fecha,
        metadata: {deviceId: deviceId, deviceType: deviceType, zonaHoraria: fecha.getTimezoneOffset()},
        mensaje: mensaje,
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