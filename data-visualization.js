// Servidor del WebSocketIO
const express = require('express');
const {createServer} = require('http');
const { Server } = require('socket.io');
const {MongoClient} = require('mongodb');

const uri = "mongodb://localhost:27017/?maxPoolSize=20";
const clientMongoDb =  new MongoClient(uri);

const app = express();
const server = createServer(app);
const io = new Server(server);

const database = {
    name : "iot-database",
    collections : {
        temp: "temperature-sensor",
        light: "light-sensor-ts"
    }
};

clientMongoDb.connect(function (err) {
    if (err) throw  err;
    console.log("Conectado Exitosamente!");
})

server.listen(3000,  () => {
    console.log("Servidor corriendo en el puerto 3000")
});

// styles sheets and scripts
app.use('/view', express.static(__dirname + '/view'));
// app.use('/view/js', express.static(__dirname + '/view/js'));
// app.use('/view/assets', express.static(__dirname + '/view/assets'));

// rutas
// app.get("/dashboard", function (req, res) {
//     res.sendFile(__dirname + "/view/dashboard.html");
//
//     clientMongoDb.db("iot-database")
//         .collection('temperature-sensor')
//         .find({})
//         .limit(10)
//         .toArray(function (err, res) {
//             if (err) throw err;
//             else {
//                 console.log(res);
//             }
//         })
//
//     clientMongoDb.db("iot-database")
//         .collection('light-sensor')
//         .find({})
//         .limit(10)
//         .toArray(function (err, res) {
//             if (err) throw err;
//             else {
//                 console.log(res);
//             }
//         })
// })

app.get("/temperature-sensor",  function (req, res) {
    res.sendFile(__dirname + "/view/temperature-analytics.html");
})

io.on("connection",  function (socket){
    console.log("Conectado por WebSockets");

    socket.on("tempCall", function(id){
        console.log("Sending data for "+ id);

        let tempData = getCollectionSorted(1,database.name,database.collections.temp)
        tempData.forEach((element)=>{
            console.log(element);
            io.emit('data',element);
        })
    });

    socket.on("lightCall",function(id){
        console.log("Sending data for "+ id);

        let lightData = getCollectionSorted(1, database.name, database.collections.light)
        lightData.forEach((element)=>{
            console.log(element);
            io.emit('data',element);
        })
    });

    socket.on("mainCall",function(id){
        console.log("Sending data for "+ id);

        let lightData = getCollectionSorted(1, database.name, database.collections.light)
        let tempData = getCollectionSorted(1,database.name,database.collections.temp)
        tempData.forEach((element)=> {
            console.log(element);
            io.emit('data', element);
        })
        lightData.forEach((element)=>{
            console.log(element);
            io.emit('data',element);
        })
    });

});

const getCollectionSorted = (sortIndex, database, collection) => {
    return clientMongoDb.db(database)
        .collection(collection)
        .find({})
        .sort({fechaEnviada : sortIndex})
}

// app.get("/light-sensor", function (req, res) {
//     io.on("connection", function (socket){
//         clientMongoDb.db("iot-database")
//             .collection('light-sensor')
//             .find({})
//             .limit(10)
//             .toArray(function (err, res) {
//                 if (err) throw err;
//                 else {
//                     console.log("Sending data ...")
//                     socket.emit('data',res);
//                 }
//             })
//     });
//
//     res.sendFile(__dirname + "/view/light-analytics.html");
// })
