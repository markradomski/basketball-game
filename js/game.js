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
	this.canvasWidth = this.sys.game.config.width;
	this.canvasHeight = this.sys.game.config.height;
	this.score = 0;
	this.triggered = false;
	//	console.log('GSAP', gsap);
}

// load asset files for our game
function preload() {
	this.load.image('backboard', 'assets/images/backboard.png');
	this.load.image('net', 'assets/images/backboard_net.png');
	this.load.image('basketball', 'assets/images/basketball.png');

	this.load.audio('rimBounce', 'assets/audio/bounce_sound.mp3');
	this.load.audio('floorBounce', 'assets/audio/bounce_floor.mp3');
	this.load.audio('whoosh', 'assets/audio/whoosh.mp3');
}

function create() {
	this.add.sprite(this.canvasWidth / 2, 250, 'backboard');
	this.net = this.add.sprite(this.canvasWidth / 2, 303, 'net').setDepth(1);
	createSounds(this);
	createBall(this);
	createLeftRightRim(this);
	createNetZone(this);

	// score
	this.scoreText = this.add.text(5, 5, 0, { font: '60px Arial', fill: '#FFF' });

	/* 	gsap.to(this.scoreText, {
		x: 200,
		duration: 2,
	}); */

	console.log('game', this);
}

function update() {
	this.ball.setAngularVelocity(this.ball.body.velocity.x);

	const ballNetOverlap = isBallNetOverlap(this);
	const ballVelocityY = this.ball.body.velocity.y;

	// check if ball is released above net rim (no cheating)
	if (ballNetOverlap && !this.triggered) {
		this.score++;
		this.triggered = true;

		console.log('SCORE', this.score);
		this.scoreText.setText(this.score);
	} else if (ballNetOverlap) {
		// slow ball down while in net
		this.ball.setVelocityY(ballVelocityY * 0.65);
		// reset
	} else {
		this.triggered = false;
	}
}

function createSounds(context) {
	context.rimBounce = context.sound.add('rimBounce', { loop: false });
	context.floorBounce = context.sound.add('floorBounce', { loop: false });
	context.whoosh = context.sound.add('whoosh', { loop: false });
}

function createBall(context) {
	context.ball = context.physics.add
		.sprite(context.canvasWidth / 2, 500, 'basketball', 0)
		.setScale(0.6)
		//.setCircle(50) // causes some odd physics
		.setInteractive()
		.setBounce(0.8)
		.setCollideWorldBounds(true);

	context.ball.body.onWorldBounds = true;

	context.physics.world.on('worldbounds', (body, up, down, left, right) => {
		context.floorBounce.play();
	});

	//make ball draggable
	context.input.setDraggable(context.ball);

	// allow cursor to drag ball
	context.input.on('drag', (pointer, gameObject, dragX, dragY) => {
		gameObject.x = dragX;
		gameObject.y = dragY;
		startDrag(gameObject, context);
	});

	context.input.on('dragend', (pointer, gameObject) => {
		stopDrag(gameObject, context);
	});
}

function createLeftRightRim(context) {
	// net rim collision points
	const zones = context.physics.add.staticGroup();

	context.leftRim = context.add.zone(
		context.net.x - context.net.displayOriginX,
		context.net.y - context.net.displayOriginY + 5,
		1,
		1
	);
	context.rightRim = context.add.zone(
		context.net.x - context.net.displayOriginX + context.net.width,
		context.net.y - context.net.displayOriginY + 5,
		1,
		1
	);
	zones.add(context.leftRim);
	zones.add(context.rightRim);
	context.physics.add.collider(context.ball, zones, onRimCollision.bind(context), null, context);
}

function createNetZone(context) {
	// ball/net overlap zone
	context.innerNet = context.add.zone(context.canvasWidth / 2, 290).setSize(20, 20);
	context.physics.world.enable(context.innerNet);
	context.innerNet.body.setAllowGravity(false);
	context.innerNet.body.moves = false;
	context.physics.add.overlap(context.ball, context.innerNet);
}

function onRimCollision(ball, zone) {
	this.rimBounce.play();
	if (ball.x < zone.x) {
		ball.setVelocityX(-101);
	} else if (ball.x > zone.x) {
		ball.setVelocityX(99);
	} else {
		// stop ball bouncing straight up if it lands dead center
		ball.setVelocityX(50 + Math.random() * 100);
	}
}

function startDrag(ball, context) {
	//can't move sprite by physics AND input
	ball.body.moves = false;
	ball.setVelocity(0, 0);
	context.rimBounce.setMute(true);
}

function stopDrag(ball, context) {
	//  re-enable it upon release
	ball.body.moves = true;
	//prevent releasing ball while overlapping net and scoring
	context.triggered = true;
	context.rimBounce.setMute(false);

	context.whoosh.play();
}

function isBallNetOverlap(context) {
	const ballTrigger = context.ball.body.touching;
	const netTrigger = context.innerNet.body.touching;
	return ballTrigger.down && netTrigger.up;
}
