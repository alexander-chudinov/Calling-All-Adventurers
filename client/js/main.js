import io from 'socket.io-client';
import 'regenerator-runtime/runtime';

const $ = document.querySelector.bind(document);

const spriteSize = 16;
const images = [];

const canvas = $('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const socket = io();

function loadSpritesheet () {
    const spritesheet = document.querySelector('img');
    const tmp = document.createElement('canvas');
    const ctx = tmp.getContext('2d');
    tmp.height = tmp.width = spriteSize;

    document.body.appendChild(tmp);

    for (let y = 0; y < 1; y++) {
        for (let x = 0; x < 1; x++) {
            ctx.drawImage(spritesheet, -x * spriteSize, -y * spriteSize)

            const imgData = canvas.toDataURL();
            const img = new Image();
            img.src = imgData;
            document.body.appendChild(img.cloneNode(true));
            images.push(img);
        }
    }

    spritesheet.addEventListener('error', console.error);

    spritesheet.addEventListener('load', function () {
    });
}

async function loadMap () {
    const { tiles } = await fetch('http://localhost:3000/map').then(res => res.json());
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[0].length; x++) {
            const spriteID = tiles[y][x];
            console.log(spriteID);
            ctx.drawImage(images[spriteID], x * spriteSize, y * spriteSize);
        }
    }
}

loadSpritesheet();
loadMap();