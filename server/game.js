const sockets = []

class Game {
    constructor(roomID, io){
        this.roomID = roomID
        this.players = []
        this.buildings = []
        this.enemies = []
        this.io = io
        // setInterval(() => this.spawnEnemy(20, 0, 0), 20000)
    };

    gameStateUpdate(){
        this.io.in(this.roomID).emit("gameStateUpdate", {
            players: this.players,
            buildings: this.buildings
        });
    }

    spawnEnemy(numberOfEnemies, x, y){
        let enemySprite = {
            "ghost1": 314,
            "ghost2": 315,
        }
        for(let i = 0; i<numberOfEnemies; i++){
            this.enemies.push({
                x, y,
                spriteID: enemySprite.ghost1
            })
        }
        this.io.in(this.roomID).emit("spawnEnemy")
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
        let fighterSprite = {
            "barbarian": 457
        }
        const hp = 10;
        console.log('player joined: ', socket.id);
        this.players.push({
            fighter,
            x: 100,
            y: 100,
            hp,
            defense: 0,
            maxHp: hp,
            direction: 0,
            equipmentID: 426,
            name: username,
            spriteID: fighterSprite[fighter],
            socketID: socket.id,
        })
        socket.join(this.roomID)
        sockets.push(socket)
    }

    playerReady (socket) {
        socket.emit('assignID', { id: socket.id });
        this.gameStateUpdate()
    }

    playerLeave(socket){
        this.removePlayerUsingSocketID(socket.id)
        socket.leave(this.roomID)
        this.gameStateUpdate()
    }

    playerMove(socketID, x, y){
        this.getPlayer(socketID).x = x
        this.getPlayer(socketID).y = y
        this.gameStateUpdate()
    }

    playerAim(socketID, direction){
        this.getPlayer(socketID).direction = direction
        this.gameStateUpdate()
    }

    playerDamage(socketID, amount){
        const player = this.getPlayer(socketID);
        player.hp = Math.min(Math.max(player.hp - amount, 0), player.maxHp);
        this.gameStateUpdate();
    }
}

module.exports = Game