var express = require('express');
var app = express();
var exprressWs = require('express-ws')(app);
app.use(express.json());
app.use(require('cors')());

var fs = require('fs');
const { uuid } = require('uuidv4');

// app.use(function (req, res, next) {
//   console.log('middleware');
//   req.testing = 'testing';
//   return next();
// });

app.get('/', function(req, res, next){
    res.send("yo");
}).get('/assets', (req, res) => {
    res.sendFile(__dirname +'/data/assets/game_assets.png')
}).get('/mapCreator', (req, res) => {
    res.sendFile(__dirname +'/data/maps/mapCreator.html')
}).get('/map', (req, res) => {
    res.sendFile(__dirname +'/data/maps/map1.json');
}).post('/newMap', (req,res)=>{
    fs.appendFile('./data/maps/'+uuid()+'.json', JSON.stringify({
        tiles:req.body
    }), function (err) {
        if (err) throw err;
        console.log('New map saved.');
    });
});

// app.ws('/', function(ws, req) {
//   ws.on('message', function(msg) {
//     console.log("ws:"+msg);
//   });
//   console.log('socket', req.testing);
// });

app.listen(3000);