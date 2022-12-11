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
	this.triggered = false;
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

	this.add.sprite(canvasWidth / 2, 250, 'backboard');

	this.net = this.add.sprite(canvasWidth / 2, 303, 'net').setDepth(1);

	//this.net.setBounds(20, 20);

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
	this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
		gameObject.x = dragX;
		gameObject.y = dragY;
		startDrag(gameObject, this);
	});

	this.input.on('dragend', (pointer, gameObject) => {
		stopDrag(gameObject, this);
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

	this.net = this.add.zone(canvasWidth / 2, 290).setSize(20, 20);
	this.physics.world.enable(this.net);
	this.net.body.setAllowGravity(false);
	this.net.body.moves = false;

	zones.add(this.leftRim);
	zones.add(this.rightRim);
	this.physics.add.collider(this.ball, zones, onCollision, null, this);
	this.physics.add.overlap(this.ball, this.net);

	console.log('game', this);
}

function update() {
	this.ball.setAngularVelocity(this.ball.body.velocity.x);
	//console.log('update', this.ball.body.velocity.y);

	const ballTrigger = this.ball.body.touching;
	const netTrigger = this.net.body.touching;
	const ballNetOverlap = ballTrigger.down && netTrigger.up;
	const velocityY = this.ball.body.velocity.y;

	// if ball is released above net rim (no cheating)
	if (ballNetOverlap && !this.triggered) {
		this.score++;
		this.triggered = true;
		console.log('SCORE', this.score, this.ball.body.velocity.y);

		// slow ball down while in net
	} else if (ballNetOverlap) {
		this.ball.setVelocityY(velocityY * 0.6);
	}

	// reset
	if (!ballNetOverlap) {
		this.triggered = false;
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

function startDrag(ball, context) {
	//can't move sprite by physics AND input
	ball.body.moves = false;
	ball.setVelocity(0, 0);
}

function stopDrag(ball, context) {
	//  re-enable it upon release
	ball.body.moves = true;
}

function checkOverlap(spriteA, spriteB) {
	var boundsA = spriteA.getBounds();
	var boundsB = spriteB.getBounds();

	return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
}

const debounce = (callback, wait) => {
	let timeoutId = null;
	return (...args) => {
		window.clearTimeout(timeoutId);
		timeoutId = window.setTimeout(() => {
			callback.apply(null, args);
		}, wait);
	};
};
