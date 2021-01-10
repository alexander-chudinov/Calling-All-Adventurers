const width = 800;
const height = 600;
const frameWidth = 16;
const frameHeight = 16;

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width, height,
    scene: { preload, create },
});

function preload () {
    game.load.spritesheet('sprites', '../assets', { frameWidth, frameHeight });
}

function update () {

}

const classTiles = {
    'barbarian': 259
}

function addPlayer (this, { x, y, type }) {
    this.add.sprite(x, y, 'sprites', classTiles[type]).setOrigin(0.5, 0.5);

}

async function create () {
    const this_ = this;
    this.socket = io();
    this.player = this.physics.add.group();

    const { tileData, buildings } = await fetch('/map.json');
    const rows = tileData.length;
    const cols = tileData[0].length;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            this.add.sprite(x * frameWidth, y * frameHeight, 'sprites', tile);
        }
    }

    this.socket.emit('placePlayer', {
        x: buildings.guild.x,
        y: buildings.guild.y,
        type: 'barbarian',
    });
}