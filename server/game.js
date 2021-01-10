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
        this.players.splice(this.playerIndex(socketID));
    }

    playerJoin(socket, username, fighter, x, y, hp){
        let fighterSprite = {
            "barbarian": 259
        }
        this.removePlayerUsingSocketID(socket.id)
        this.players.push({
            name: username,
            fighter: fighterSprite[fighter],
            x, y, hp, socket
        })
        socket.join(this.roomID)
        this.gameStateUpdate()
    }

    playerLeave(socket){
        this.removePlayerUsingSocketID(socket.id)
        socket.leave(this.roomID)
        this.gameStateUpdate()
    }

    playerMove(socket, x, y){
        this.players[this.playerIndex(socket.id)].x = x
        this.players[this.playerIndex(socket.id)].y = y
        this.gameStateUpdate()
    }
}

module.exports = Game