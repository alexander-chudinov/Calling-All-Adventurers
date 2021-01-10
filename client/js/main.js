import io from 'socket.io-client';
import 'regenerator-runtime/runtime';

const $ = document.querySelector.bind(document);

const spriteSize = 16;
const images = [];

const canvas = $('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const socket = io.connect('http://localhost:3000', {reconnect: true});

setInterval(() => socket.emit('ping'), 2000)


async function loadSpritesheet () {
    const spritesheet = document.querySelector('img');
    const tmp = document.createElement('canvas');
    const ctx = tmp.getContext('2d');
    tmp.height = tmp.width = spriteSize;

    for (let y = 0; y < 22; y++) {
        for (let x = 0; x < 48; x++) {
            ctx.clearRect(0, 0, spriteSize, spriteSize);
            ctx.drawImage(spritesheet, -x * spriteSize, -y * spriteSize)

            const imgData = tmp.toDataURL();
            const img = new Image();
            img.src = imgData;

            await new Promise(function (res) {
                img.addEventListener('load', function () {
                    images.push(img);
                    res();
                });
            });
        }
    }
}

async function loadMap () {
    ctx.fillStyle = '#3d2a17';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { tiles } = await fetch('http://localhost:3000/map/2').then(res => res.json());
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[0].length; x++) {
            const spriteID = tiles[y][x];
            ctx.drawImage(images[spriteID], x * spriteSize, y * spriteSize);
        }
    }
}

loadSpritesheet().then(loadMap);