// our game's configuration
let config = {
	type: Phaser.AUTO,
	width: 640,
	height: 640,
	scene: {
		preload,
		create,
		update,
	},

	title: 'Basketball Game',
	pixelArt: false, // anti-aliased
};

// create the game, and pass it the configuration
const game = new Phaser.Game(config);

// load asset files for our game
function preload() {}

function create() {}

function update() {}
