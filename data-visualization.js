// Servidor del WebSocketIO
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const {MongoClient} = require('mongodb');

const uri = "mongodb://3.95.224.80:27017/?maxPoolSize=20";
const clientMongoDb =  new MongoClient(uri);

var app = express();
var server = http.Server(app);
var io = socketIO(server);

clientMongoDb.connect(function (err) {
    if (err) throw  err;
    console.log("Conectado Exitosamente!");
    app.listen(3000,  () => {
        console.log("Serividor corriendo en el puerto 3000")
    });
})

// styles sheets and scripts
app.use('/view/css', express.static(__dirname + '/view/css'));
app.use('/view/js', express.static(__dirname + '/view/js'));
app.use('/view/assets', express.static(__dirname + '/view/assets'));

// rutas
app.get("/dashboard", function (req, res) {
    res.sendFile(__dirname + "/view/dashboard.html");

    clientMongoDb.db("iot-database")
        .collection('temperature-sensor')
        .find({})
        .limit(10)
        .toArray(function (err, res) {
            if (err) throw err;
            else {
                console.log(res);
            }
        })

    clientMongoDb.db("iot-database")
        .collection('light-sensor')
        .find({})
        .limit(10)
        .toArray(function (err, res) {
            if (err) throw err;
            else {
                console.log(res);
            }
        })
})

app.get("/temperature-sensor", function (req, res) {

    io.on("connection", function (socket){
        clientMongoDb.db("iot-database")
            .collection('temperature-sensor')
            .find({})
            .limit(10)
            .toArray(function (err, res) {
                if (err) throw err;
                else {
                    console.log("Sending data ...")
                    socket.emit('data',res);
                }
            })
    });
    res.sendFile(__dirname + "/view/temperature-analytics.html");
})

app.get("/light-sensor", function (req, res) {
    io.on("connection", function (socket){
        clientMongoDb.db("iot-database")
            .collection('light-sensor')
            .find({})
            .limit(10)
            .toArray(function (err, res) {
                if (err) throw err;
                else {
                    console.log("Sending data ...")
                    socket.emit('data',res);
                }
            })
    });

    res.sendFile(__dirname + "/view/light-analytics.html");
})
