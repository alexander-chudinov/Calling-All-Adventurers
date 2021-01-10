const sockets = []
const spriteSize = 16;
const graves = [
    [25, 3],
    [29, 3],
    [25, 7],
    [29, 7],
    [7, 35],
    [9, 36],
    [8, 37],
]

function randBetween(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Game {
    constructor(roomID, io){
        this.roomID = roomID
        this.players = []
        this.buildings = []
        this.enemies = []
        this.io = io
        this.progressiveDifficulty = 3
        setInterval(() => {if(this.remainingPlayers().length>0){this.spawnEnemy(this.progressiveDifficulty * this.players.length)}else{this.enemies=[]}}, 10000)
        setInterval(() => this.moveEnemies(), 1000/30)
        setInterval(() => {if(this.progressiveDifficulty<9){this.progressiveDifficulty+=2}}, 10000)
    };

    gameStateUpdate(){
        this.io.in(this.roomID).emit("gameStateUpdate", {
            players: this.players,
            enemies: this.enemies,
            buildings: this.buildings
        });
    }

    randElement(list){
        return list[randBetween(0,list.length)]
    }

    spawnEnemy(numberOfEnemies){
        //TODO ADD MORE
        let enemyTypes = [
            {
                spriteID:314,
                attack: 2,
                hp: 150,
                maxHp: 150,
                speed: 1.5
            },{
                spriteID: 315,
                attack: 3,
                hp: 300,
                maxHp: 300,
                speed: 1
            }
        ]

        let randomEnemy = () => {
            return this.randElement(enemyTypes)
        }

        for(let i = 0; i < numberOfEnemies; i++){
            let enemy = randomEnemy();
            const grave = this.randElement(graves);
            this.enemies.push({
                id: uuidv4(),
                x: grave[0] * spriteSize,
                y: grave[1] * spriteSize,
                speed: enemy.speed,
                attack: enemy.attack,
                hp: enemy.hp,
                maxHp: enemy.maxHp,
                spriteID: enemy.spriteID,
                targetPlayerIndex: randBetween(0,this.players.length)
            })
        }

        this.gameStateUpdate()
    }

    remainingPlayers(){
        return this.players.filter(p => p.hp > 0)
    }

    moveEnemies(){
        for(const enemy of this.enemies){
            if(enemy.targetPlayerIndex === -1) continue;
            if(this.players[enemy.targetPlayerIndex]){
                let { x, y } = this.players[enemy.targetPlayerIndex];
                const dx = enemy.x - x;
                const dy = enemy.y - y;
                let angle = Math.atan2(dy, dx) + Math.PI;
                if(Math.hypot(dx, dy)<1){
                    if(this.players[enemy.targetPlayerIndex].hp > 0){
                        this.damagePlayer(this.players[enemy.targetPlayerIndex], enemy.attack);
                    }
                }
                if(this.players[enemy.targetPlayerIndex].hp <= 0){
                    let remainingPlayers = this.players.filter(p => p.hp > 0)
                    if(remainingPlayers.length>0){
                        enemy.targetPlayerIndex = this.players.indexOf(this.randElement(remainingPlayers))
                    } else {
                        enemy.targetPlayerIndex = -1;
                        angle = Math.atan2(dy, dx)
                    }
                }
                enemy.x += enemy.speed * Math.cos(angle);
                enemy.y += enemy.speed * Math.sin(angle);
            }
        }
        this.gameStateUpdate()
    }

    playerIndex(socketID) {
        return this.players.findIndex(p => p.socketID === socketID);
    }

    getPlayer(socketID) {
        return this.players.find(p => p.socketID === socketID);
    }

    removePlayerUsingSocketID(socketID){
        let targetIndex = this.playerIndex(socketID)
        this.players.splice(targetIndex);
        sockets.splice(targetIndex);
    }

    playerJoin(socket, username, fighter){
        let fighterTypes = [
            {
                fighter: "barbarian",
                spriteID: 457,
                attack: 6,
                maxHp: 130,
                speed: 2,
                equipmentID: 426,
                range: 16,
            },
            {
                fighter: "ninja",
                spriteID: 462,
                attack: 4,
                maxHp: 40,
                speed: 3,
                equipmentID: 323,
                range: 16,
            },
            {
                fighter: "astronaut",
                spriteID: 460,
                attack: 3,
                maxHp: 80,
                speed: 2,
                equipmentID: 468,
                range: 20
            },
            {
                fighter: "gunner",
                spriteID: 25,
                attack: 9,
                maxHp: 50,
                speed: 3,
                equipmentID: 471,
                range: 14
            },
            {
                fighter: "dog",
                spriteID: 367,
                attack: 999,
                maxHp: 1,
                speed: 4,
                equipmentID: 802,
                range: 14
            },
            {
                fighter: "wizard",
                spriteID: 312,
                attack: 11,
                maxHp: 60,
                speed: 2,
                equipmentID: (Math.random() > 0.5) + 555,
                range: 40
            },
            {
                fighter: "farmer",
                spriteID: 127,
                attack: 2,
                maxHp: 40,
                speed: 3,
                equipmentID: 131,
                range: 20
            }
        ]

        const selectedFighter = fighterTypes.find(f => f.fighter === fighter);

        console.log('player joined: ', socket.id);
        this.players.push({
            fighter,
            x: 200,
            y: 200,
            hp: selectedFighter.maxHp,
            maxHp: selectedFighter.maxHp,
            speed: selectedFighter.speed,
            equipX: 0,
            equipY: 0,
            defense: 0,
            attack: selectedFighter.attack,
            direction: 0,
            equipmentID: selectedFighter.equipmentID,
            name: username,
            spriteID: selectedFighter.spriteID,
            socketID: socket.id,
            range: selectedFighter.range,
            state: "connected"
        })
        socket.join(this.roomID)
        sockets.push(socket)
    }

    playerReady (socket) {
        const player = this.players.find(p => p.socketID === socket.id);
        socket.emit('assignData', {
            id: socket.id,
            speed: player.speed
        });
        this.gameStateUpdate()
    }

    playerLeave(socket){
        // this.removePlayerUsingSocketID(socket.id)
        this.players = this.players.filter(e => e.socketID != socket.id);
        socket.leave(this.roomID)
        this.gameStateUpdate()
    }

    playerMove(socketID, x, y){
        const player = this.getPlayer(socketID)
        if (player) {
            player.x = x
            player.y = y
            this.moveEquip(player);
            this.gameStateUpdate()
        }
    }

    moveEquip(player) {
        const { x, y } = player;
        const ox = x - spriteSize / 2, oy = y - spriteSize / 2;

        player.equipX = ox - 2 + Math.cos(player.direction) * player.range;
        player.equipY = oy - 2 + Math.sin(player.direction) * player.range;
    }

    playerAim(socketID, direction){
        const player = this.getPlayer(socketID);
        if (!player || player.hp <= 0) return;

        player.direction = direction;
        this.moveEquip(player);

        for(const enemy of this.enemies){
            if(Math.hypot(player.equipX - enemy.x, player.equipY - enemy.y)<=spriteSize){
                enemy.hp = Math.min(Math.max(enemy.hp - player.attack, 0), enemy.maxHp);
            }
        }

        this.enemies = this.enemies.filter(e => e.hp > 0);

        this.gameStateUpdate()
    }

    damagePlayer(player, amount) {
        if(player){
            if (player.hp === 0) {
                return;
            }
            player.hp = Math.min(Math.max(player.hp - amount, 0), player.maxHp);
            if(player.hp === 0){
                player.spriteID = 610
                player.equipmentID = 0
            }
            if(this.remainingPlayers().length===0){
                this.io.in(this.roomID).emit("gameOver")
            }
        }
    }

    playerDamage(socketID, amount){
        this.damagePlayer(this.getPlayer(socketID), amount)
        this.gameStateUpdate();
    }
}

module.exports = Game