import { $, drawMap, socket, images, spriteSize, collidables } from './main';

const canvas = $('canvas');
const ctx = canvas.getContext('2d');

let players = [],
    enemies = [],
    mapState = [],
    keys = {},
    player = {
        id: '',
        x: 200,
        y: 200,
        speed: 3,
        maxSpeed: 3,
        direction: 0,
        hp:10,
        equipX: 0,
        equipY: 0,
        maybeMove () {
            const initX = this.x, initY = this.y;

            const colMatr = this.checkCollisions();

            if (keys['KeyW'] && colMatr[2][1] !== 0) this.y -= this.speed;
            if (keys['KeyS'] && colMatr[0][1] !== 0) this.y += this.speed;
            if (keys['KeyA'] && colMatr[1][0] !== 0) this.x -= this.speed;
            if (keys['KeyD'] && colMatr[1][2] !== 0) this.x += this.speed;

            this.x = Math.min(Math.max(this.x, spriteSize), canvas.width - spriteSize);
            this.y = Math.min(Math.max(this.y, spriteSize), canvas.height - spriteSize);

            const { x, y } = this;
            if (x !== initX || y !== initY)
                socket.emit('playerMove', { x, y });
        },
        maybeApplyEffects () {
            const xIndex = Math.floor(this.x / spriteSize);
            const yIndex = Math.floor(this.y / spriteSize);

            const effect = collidables[yIndex][xIndex];
            if (effect === 1) {
                this.speed = this.maxSpeed / 2;
            } else {
                this.speed = this.maxSpeed;
                if (effect === 0) {
                    // player is somehow inside of a block
                    this.x += spriteSize;
                    this.y += spriteSize;
                } else if (effect === 2) {
                    // damaging
                    socket.emit('playerDamage', {  damage: 1 });
                } else if (effect === 3) {
                    // healing
                    socket.emit('playerDamage', { damage: -1 });
                }
            }
        },
        maybeDamagePlayer() {
            for (const player of players) {
                if (
                    player.socketID !== this.id &&
                    player.hp > 0 &&
                    Math.sqrt(
                        (this.x - player.equipX) ** 2 +
                        (this.y - player.equipY) ** 2
                    ) <= spriteSize
                ) {
                    socket.emit('playerDamage', { damage: 1 });
                }
            }
        },
        checkCollisions () {
            try{
                const { x, y } = this;

                const x_index = Math.floor(x / spriteSize);
                const y_index = Math.floor(y / spriteSize);

                const colMatr = [
                    [null, null,                            null],
                    [null, collidables[y_index][x_index],   null],
                    [null, null,                            null]
                ]

                // Valid directions
                const v_dir = {
                    N: false,
                    S: false,
                    E: false,
                    W: false
                }

                //fill out cardinal directions first
                if(y_index+1<50){
                    //square above exists, add to collision matrix
                    colMatr[0][1] = collidables[y_index+1][x_index]
                    v_dir.N = true
                }
                if(y_index-1>=0){
                    //square below exists, add to collision matrix
                    colMatr[2][1] = collidables[y_index-1][x_index]
                    v_dir.S = true
                }
                if(x_index+1<=37){
                    //right square exists, add to collision matrix
                    colMatr[1][2] = collidables[y_index][x_index+1]
                    v_dir.E = true
                }
                if(x_index-1>=0){
                    //left square exists, add to collision matrix
                    colMatr[1][0] = collidables[y_index][x_index-1]
                    v_dir.W = true
                }

                //next fill out corners
                if(v_dir.N && v_dir.E){
                    //north-east exists, add to collisition matrix
                    colMatr[0][2] = collidables[y_index+1][x_index+1]
                }

                //next fill out corners
                if(v_dir.N && v_dir.W){
                    //north-east exists, add to collisition matrix
                    colMatr[0][0] = collidables[y_index+1][x_index-1]
                }

                //next fill out corners
                if(v_dir.S && v_dir.E){
                    //north-east exists, add to collisition matrix
                    colMatr[2][2] = collidables[y_index-1][x_index+1]
                }

                //next fill out corners
                if(v_dir.S && v_dir.W){
                    //north-east exists, add to collisition matrix
                    colMatr[2][0] = collidables[y_index-1][x_index-1]
                }

                return colMatr
            } catch { }
            return [
                [null, null, null],
                [null, null, null],
                [null, null, null]
            ]
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

    socket.emit('ready');

    socket.on('gameStateUpdate', function (data) {
        players = data.players;
        enemies = data.enemies;
    });

    socket.on('assignData', function (data) {
        player.id = data.id;
        player.speed = player.maxSpeed = data.speed;
    });

    const showGameOver = () => {
        $('#game-over').classList.remove('invisible')
    }

    socket.on('gameOver', function(){
        showGameOver()
    })
}

function gameLoop () {
    if (player.hp > 0) {
        player.maybeMove();
        player.maybeApplyEffects();
        player.maybeDamagePlayer();
    }

    draw();

    requestAnimationFrame(gameLoop);
}


const fontSize = 13;
const hpBarWidth = 24;
ctx.font = fontSize + 'px Pirata One';
async function draw () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await drawMap(mapState);

    for (const { x, y, name, direction, equipmentID, spriteID, hp, maxHp, equipX, equipY } of players) {
        const ox = x - spriteSize / 2, oy = y - spriteSize / 2;

        ctx.drawImage(images[spriteID], ox, oy);
        const offset = ctx.measureText(name).width / 2

        player.equipX = equipX;
        player.equipY = equipY;

        ctx.drawImage(images[equipmentID], equipX, equipY);

        // HP
        // BG
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - hpBarWidth / 2, oy - 4, hpBarWidth, 3);

        // FG
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x - hpBarWidth / 2, oy - 4, hp / maxHp * hpBarWidth, 3);

        if(name){
            // Player name tag
            // BG
            ctx.fillStyle = '#ededed';
            ctx.fillRect(x - offset - 2, y - fontSize * 2 - 2, offset * 2 + 4, fontSize + 2);

            // FG
            ctx.fillStyle = '#181818';
            ctx.fillText(name, x - offset, y - fontSize - 2);
        }
    }

    for (const enemy of enemies){
        const { x, y, spriteID, hp, maxHp } = enemy;
        const ox = x - spriteSize / 2, oy = y - spriteSize / 2;

        ctx.drawImage(images[spriteID], ox, oy);

        // HP
        // BG
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(x - hpBarWidth / 2, oy - 4, hpBarWidth, 3);

        // FG
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(x - hpBarWidth / 2, oy - 4, hp / maxHp * hpBarWidth, 3);
    }
}
