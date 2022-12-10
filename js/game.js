// our game's configuration
let config = {
	type: Phaser.AUTO,
	width: 640,
	height: 640,
	backgroundColor: '#4488aa',
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
function preload() {
	this.load.image('backboard', 'assets/images/backboard.png');
	this.load.image('net', 'assets/images/backboard_net.png');
	this.load.image('basketball', 'assets/images/basketball.png');

	this.load.audio('bounce', 'assets/audio/bounce_sound.mp3');
	this.load.audio('whoosh', 'assets/audio/whoosh.mp3');
}

function create() {
	const canvasWidth = this.sys.game.config.width;
	const canvasHeight = this.sys.game.config.height;

	this.add.sprite(0, 0, 'backboard').setPosition(canvasWidth / 2, 150);

	this.net = this.add
		.sprite(0, 0, 'net')
		.setPosition(canvasWidth / 2, 203)
		.setDepth(1);

	this.ball = this.add.sprite(canvasWidth / 2, 500, 'basketball', 0).setScale(0.6);
}

function update() {}
