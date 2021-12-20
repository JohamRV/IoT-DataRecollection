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
// app.use('/view/assets', express.static(__dirname + '/view/assets'));
// app.use('/view/js', express.static(__dirname + '/view/js'));
// app.use('/view/css', express.static(__dirname + '/view/css'));

app.get("/temperature-sensor",  function (req, res) {
    res.sendFile(__dirname + "/view/temperature-analytics.html");
})

app.get("/light-sensor",  function (req, res) {
    res.sendFile(__dirname + "/view/light-analytics.html");
})

app.get("/dashboard",  function (req, res) {
    res.sendFile(__dirname + "/view/dashboard.html");
})

io.on("connection",  function (socket){
    console.log("Conectado por WebSockets");

    socket.on("tempCall", function(id){
        console.log("Sending data for "+ id);
        let tempData = getCollectionSorted(1,database.name,database.collections.temp)
        let dataToSend = [];
        let cont = 0;
        tempData.forEach((element)=>{
            // getFormatDate(element.fechaEnviada)
            dataToSend.push([cont,element.temperature]) //element.timestamp
            io.emit('data',dataToSend);
            cont++;
        })
    });

    socket.on("lightCall",function(id){
        console.log("Sending data for "+ id);

        let lightData = getCollectionSorted(1, database.name, database.collections.light)
        let dataToSend = [];
        let cont = 0;
        lightData.forEach((element)=>{

            console.log(element.mensaje)
            if (element.mensaje == "No se detectó presencia"){
                dataToSend.push([cont,0])
            }else if (element.mensaje == "Se detectó presencia"){
                dataToSend.push([cont,10])
            } else {
                dataToSend.push([cont,10])
            }
            console.log(dataToSend)
            io.emit('data2',dataToSend);
            cont++;
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
    // .limit(50)
}

const getFormatDate = (str) => {
    return new Date(
        parseInt(str.split('T')[0]('-')[0]),
        parseInt(str.split('T')[0]('-')[1])-1,
        parseInt(str.split('T')[0]('-')[2]),
        parseInt(str.split('T')[1](':')[0]),
        parseInt(str.split('T')[1](':')[1]),
        parseInt(str.split('T')[1](':')[2])
        );
}