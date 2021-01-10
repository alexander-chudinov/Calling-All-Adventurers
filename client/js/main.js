import io from 'socket.io-client';
import 'regenerator-runtime/runtime';

const $ = document.querySelector.bind(document);

const spriteSize = 16;
const images = [];

const canvas = $('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const socket = io.connect('http://localhost:3000', {
    reconnect: true
});

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
            img.dataset.spriteID = y * 22 + x;

            await new Promise(function (res) {
                img.addEventListener('load', function () {
                    images.push(img);
                    res();
                });
            });
        }
    }
}

function drawMap (tiles) {
    for (let y = 0; y < tiles.length; y++) {
        for (let x = 0; x < tiles[0].length; x++) {
            const spriteID = tiles[y][x];
            ctx.drawImage(images[spriteID], x * spriteSize, y * spriteSize);
        }
    }
}

const collidables = [];
async function storeCollidables (tiles) {
    const tileTypes = await fetch('http://localhost:3000/tileTypes').then(r => r.json());
    for (let y = 0; y < tiles.length; y++) {
        collidables.push([]);
        for (let x = 0; x < tiles[0].length; x++) {
            for (const [ type, idxs ] of Object.entries(tileTypes)) {
                if (idxs.includes(tiles[y][x])) {
                    collidables[y][x] = type;
                    break
                } else collidables[y][x] = false;
            }
        }
    }
}

async function loadMap () {
    const { tiles } = await fetch('http://localhost:3000/map/2').then(res => res.json());
    drawMap(tiles);
    await storeCollidables(tiles);
    return tiles;
}

async function userLoad () {
    $('#join-message').classList.remove('invisible');

    await new Promise(function (res) {
        $('form').addEventListener('submit', function (evt) {
            evt.preventDefault();
            socket.emit('playerJoin', {
                name: $('#player-name').value,
                fighter: evt.submitter.name,
            })
            $('#join-message').classList.add('invisible');
            canvas.classList.remove('invisible');
            res();
        });
    });
}

(async function () {
    const initialState = await loadSpritesheet().then(loadMap);
    userLoad().then(async function () {
        (await import('./game')).init(initialState);
    });
})();

export { $, drawMap, socket, images, spriteSize, collidables };