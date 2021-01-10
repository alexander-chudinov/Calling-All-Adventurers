var fs = require('fs');
const { v4 } = require('uuid');
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
    fs.appendFile('./data/maps/'+v4()+'.json', JSON.stringify({
        tiles:req.body
    }), function (err) {
        if (err) throw err;
        console.log('New map saved.');
    });
}).get('/tileTypes', (req, res) => {
    res.sendFile(__dirname + '/data/maps/tileTypes.json')
});

const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*'
    }
});

const game = new Game(v4(), io)

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('playerJoin', (data) => {
        const { name, fighter } = data;
        console.log(name, fighter);
        game.playerJoin(socket, name, fighter);
    }).on('ready', () => {
        game.playerReady(socket);
    }).on('playerMove', ({ x, y }) => {
        game.playerMove(socket.id, x, y)
    }).on('playerAim', ({ direction }) => {
        game.playerAim(socket.id, direction)
    }).on('playerDamage', ({ damage }) => {
        game.playerDamage(socket.id, damage)
    }).on('disconnect', () => {
        game.playerLeave(socket)
    });

})

http.listen(3000, () => {
    console.log('listening on *:3000');
});