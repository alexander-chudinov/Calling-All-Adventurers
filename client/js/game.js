import { $, drawMap, socket, images } from './main';

const canvas = $('canvas');
const ctx = canvas.getContext('2d');

let players = [], 
    mapState = {},
    keys = {},
    player = {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        speed: 3,
        maybeMove: function () {
            const initX = this.x, initY = this.y;

            if (keys['KeyW']) this.y -= this.speed;
            if (keys['KeyS']) this.y += this.speed;
            if (keys['KeyA']) this.x -= this.speed;
            if (keys['KeyD']) this.x += this.speed;

            const { x, y } = this;
            if (x !== initX || y !== initY)
                socket.emit('playerMove', { x, y });
        }
    };

function registerKeyListeners () {
    document.addEventListener('keydown', ({ code }) => keys[code] = true);
    document.addEventListener('keyup', ({ code }) => keys[code] = false);
}

export function init(mapState_) {
    mapState = mapState_;

    registerKeyListeners();
    gameLoop();

    socket.on('gameStateUpdate', function (data) {
        players = data.players;
        console.log('HOW');
    });
}

function gameLoop () {
    player.maybeMove();
    draw();

    requestAnimationFrame(gameLoop);
}

async function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await drawMap(mapState);
    
    for (const player of players) {
        const { x, y, name, spriteID } = player;
        ctx.drawImage(images[spriteID], x, y);
        ctx.fillText(name, x - ctx.measureText(name).width / 2, y - 10);
    }
}
