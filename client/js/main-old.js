import Phaser from 'phaser';
import io from 'socket.io-client';
import 'regenerator-runtime/runtime';

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
    this.load.spritesheet('sprites', '../assets', { frameWidth, frameHeight });
}

function update () {

}

const classTiles = {
    'barbarian': 259
}

function addPlayer (this_, { x, y, type }) {
    this_.add.sprite(x, y, 'sprites', classTiles[type]).setOrigin(0.5, 0.5);

}

async function create () {
    const this_ = this;
    this.socket = io();
    this.players = [];

    const { tiles, buildings } = await fetch('http://localhost:3000/map').then(r => r.json());
    const rows = tiles.length;
    const cols = tiles[0].length;

    const mapSprites = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            mapSprites[y * rows + x] = this.add.sprite(x * frameWidth, y * frameHeight, 'sprites');
            mapSprites[y * rows + x].frame = tiles[y][x];
        }
    }
    console.log(mapSprites.map(c => c.frame));

    this.socket.emit('placePlayer', {
        x: buildings.guild.x,
        y: buildings.guild.y,
        type: 'barbarian',
    });
}