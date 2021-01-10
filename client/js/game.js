import { $, drawMap, socket, images, spriteSize } from './main';

const canvas = $('canvas');
const ctx = canvas.getContext('2d');


let players = [], 
    mapState = {},
    keys = {},
    player = {
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        speed: 3,
        direction: 0,
        maybeMove: function () {
            const initX = this.x, initY = this.y;

            if (keys['KeyW']) this.y -= this.speed;
            if (keys['KeyS']) this.y += this.speed;
            if (keys['KeyA']) this.x -= this.speed;
            if (keys['KeyD']) this.x += this.speed;

            this.x = Math.min(Math.max(this.x, 0), canvas.width);
            this.y = Math.min(Math.max(this.y, 0), canvas.height);

            const { x, y } = this;
            if (x !== initX || y !== initY)
                socket.emit('playerMove', { x, y });
        }
    };

function registerListeners () {
    document.addEventListener('keydown', ({ code }) => keys[code] = true);
    document.addEventListener('keyup', ({ code }) => keys[code] = false);

    document.addEventListener('mousemove', function (evt) {
        const x = evt.pageX - (canvas.offsetLeft - canvas.width / 2);
        const y = evt.pageY - (canvas.offsetTop - canvas.height / 2);
        player.direction = Math.PI + Math.atan2(player.y - y, player.x - x);
        socket.emit('playerAim', { direction: player.direction });
    });
}

export function init(mapState_) {
    mapState = mapState_;

    registerListeners();
    gameLoop();
    
    socket.on('gameStateUpdate', function (data) {
        players = data.players;
    });
}

function gameLoop () {
    player.maybeMove();
    draw();

    requestAnimationFrame(gameLoop);
}


const fontSize = 13;
const hpBarWidth = 24;
ctx.font = fontSize + 'px Pirata One';
async function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await drawMap(mapState);
    
    for (const player of players) {
        const { x, y, name, direction, equipmentID, spriteID, hp, maxHp } = player;

        const ox = x - spriteSize / 2, oy = y - spriteSize / 2;

        ctx.drawImage(images[spriteID], ox, oy);
        const offset = ctx.measureText(name).width / 2

        ctx.drawImage(images[equipmentID], ox + Math.cos(direction) * spriteSize, oy + Math.sin(direction) * spriteSize);

        // HP
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - hpBarWidth / 2, oy - 4, hpBarWidth, 3);

        // HP
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x - hpBarWidth / 2, oy - 4, hp / maxHp * hpBarWidth, 3);

        // Player name tag
        // BG
        ctx.fillStyle = '#ededed';
        ctx.fillRect(x - offset - 2, y - fontSize * 2 - 2, offset * 2 + 4, fontSize + 2);

        // FG
        ctx.fillStyle = '#181818';
        ctx.fillText(name, x - offset, y - fontSize - 2);
    }
}
