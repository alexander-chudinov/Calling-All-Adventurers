var fs = require('fs');
const { uuid } = require('uuidv4');
const Game = require('./game')
const express = require('express');
const app = express();

app.use(express.json());
app.use(require('cors')());

app.get('/', function(req, res, next){
    res.send("yo");
}).get('/assets', (req, res) => {
    res.sendFile(__dirname + '/data/assets/game_assets.png')
}).get('/mapCreator', (req, res) => {
    res.sendFile(__dirname + '/data/maps/mapCreator.html')
}).get('/map/:id', (req, res) => {
    res.sendFile(`${__dirname}/data/maps/map${req.params.id}.json`);
}).post('/newMap', (req,res)=>{
    fs.appendFile('./data/maps/'+uuid()+'.json', JSON.stringify({
        tiles:req.body
    }), function (err) {
        if (err) throw err;
        console.log('New map saved.');
    });
});

const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});