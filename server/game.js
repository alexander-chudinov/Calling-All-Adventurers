class Game {
    constructor(roomID, io){
        this.roomID = roomID
        this.players = []
        this.buildings = []
        this.enemies = []
        this.io = io
        setInterval(() => this.spawnEnemy(20, 0, 0), 20000)
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
                x:x,
                y:y,
                spriteID: enemySprite.ghost
            })
        }
        this.io.in(this.roomID).emit("spawnEnemy")
    }

    playerIndex(socketID){
        for(let x=0;x<this.players.length;x++){
            if(this.players[x].socketID===socketID){
                return x
            }
        }
        return null
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
            fighter: fighterSprite.barbarian,
            x:x||0,
            y:y||0,
            hp:10,
            socket: socket
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