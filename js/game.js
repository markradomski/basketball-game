let config = {
	type: Phaser.AUTO,
	width: 640,
	height: 640,
	backgroundColor: '#4488aa',
	scene: {
		init,
		preload,
		create,
		update,
	},
	physics: {
		default: 'arcade',
		arcade: {
			debug: true,
			gravity: { y: 2000 },
		},
	},
	title: 'Basketball Game',
	pixelArt: false, // anti-aliased
};

const game = new Phaser.Game(config);

function init() {
	this.score = 0;
}

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

	this.add.sprite(0, 0, 'backboard').setPosition(canvasWidth / 2, 250);

	this.net = this.add
		.sprite(0, 0, 'net')
		.setPosition(canvasWidth / 2, 303)
		.setDepth(1);

	// Ball
	this.ball = this.physics.add
		.sprite(canvasWidth / 2, 500, 'basketball', 0)
		.setScale(0.6)
		//.setCircle(50) // causes some odd physics
		.setInteractive()
		.setBounce(0.8)
		.setCollideWorldBounds(true);

	//make ball draggable
	this.input.setDraggable(this.ball);

	// allow cursor to drag ball
	this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
		gameObject.x = dragX;
		gameObject.y = dragY;
		startDrag(gameObject);
	});

	this.input.on('dragend', function (pointer, gameObject) {
		stopDrag(gameObject);
	});

	// net collision points
	const zones = this.physics.add.staticGroup();

	this.leftRim = this.add.zone(
		this.net.x - this.net.displayOriginX,
		this.net.y - this.net.displayOriginY + 5,
		1,
		1
	);
	this.rightRim = this.add.zone(
		this.net.x - this.net.displayOriginX + this.net.width,
		this.net.y - this.net.displayOriginY + 5,
		1,
		1
	);

	zones.add(this.leftRim);
	zones.add(this.rightRim);
	this.physics.add.collider(this.ball, zones, onCollision, null, this);

	console.log('game', this);
}

function update() {
	this.ball.setAngularVelocity(this.ball.body.velocity.x);
	console.log('update', this.ball.x, this.net.x, this.net.y);

	if (
		this.ball.x >= this.net.x &&
		this.ball.x <= this.net.x + this.net.width &&
		this.ball.y === this.net.y
	) {
		console.log('SCORE');
	}
}

function onCollision(ball, zone) {
	//	console.log('collsion', ball, zone);

	if (ball.x < zone.x) {
		ball.setVelocityX(-100);
	} else if (ball.x > zone.x) {
		ball.setVelocityX(100);
	} else {
		// stop ball bouncing straight up if it lands dead center
		ball.setVelocityX(50 + Math.random() * 100);
	}
}

function startDrag(ball) {
	//can't move sprite by physics AND input
	ball.body.moves = false;
	ball.setVelocity(0, 0);
}

function stopDrag(ball) {
	//  re-enable it upon release
	ball.body.moves = true;
}
