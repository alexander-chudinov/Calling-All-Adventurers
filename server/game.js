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
        })
    }

    spawnEnemy(numberOfEnemies, x, y){
        let enemySprite = {
            "ghost": 195
        }
        for(let i = 0; i<numberOfEnemies; i++){
            this.enemies.push({
                x, y,
                spriteID: enemySprite.ghost
            })
        }
        this.io.in(this.roomID).emit("spawnEnemy")
    }

    playerIndex(socketID){
        return this.players.findIndex(p => p.socketID === socketID);
    }

    removePlayerUsingSocketID(socketID){
        let targetIndex = this.playerIndex(socketID)
        this.players.splice(targetIndex);
        sockets.splice(targetIndex);
    }

    playerJoin(socket, username, fighter, x, y, hp){
        let fighterSprite = {
            "barbarian": 259
        }
        this.removePlayerUsingSocketID(socket.id)
        this.players.push({
            name: username,
            fighter: fighterSprite[fighter],
            socketID: socket.id,
            x, y, hp
        })
        socket.join(this.roomID)
        sockets.push(socket)
        this.gameStateUpdate()
    }

    playerLeave(socket){
        this.removePlayerUsingSocketID(socket.id)
        socket.leave(this.roomID)
        this.gameStateUpdate()
    }

    playerMove(socketID, x, y){
        this.players[this.playerIndex(socketID)].x = x
        this.players[this.playerIndex(socketID)].y = y
        this.gameStateUpdate()
    }
}

module.exports = Game