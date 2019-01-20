//declaration of variables
var move_to_do = 1;
var heading_to_do = 0;
var move_made = 0;
var timer = 0;
var delay_timer = 3;
var score = 0;
var next5 = 5;
var lives = 0;
var mode = 0;
var vel = 0;
var total = 0;
var power = 0;
var distb4 = 0;
var bomb = true;
var explode = true;
var game = true;

//Start game
async function start() {
	setBackLed(36);
	setMainLed({ r: 241, g: 255, b: 67 });
	await speak('Ensure the blue light is facing you.', true);
	setStabilization(false);
	await delay(3);
	resetAim();
	setStabilization(false);
	await speak('Tilt towards you to play Bomber. Away from to play Speed Tilt and right to play Punch', false);
}

//choose the game
async function startProgram() {
	await start();
	game = false;
	while (true) {
		if (game !== true) {
			if (getOrientation().pitch <= -30) {
				setBackLed(0);
				await speedTilt();
				game = true;
			}
			if (getOrientation().pitch >= 30) {
				setBackLed(0);
				await bomber();
				game = true;
			}
			if (getOrientation().roll >= 30) {
				setBackLed(0);
				await punch();
				game = true;
			}
		}
		await delay(0.025);
	}
}



//game instructions upon choosing
async function onLanding() {
	if (mode === 2) {
		await speak('How to play', true);
		mode = 3;
		await speak('When a bomb appears, throw your sphero upwards to avoid exploding it', true);
		await speak('You have 3 lives. Good luck.', true);
		mode = 1;
	}
	if (mode === 4) {
		await speak('How to play', true);
		mode = 5;
		await speak('Tilt the green side to earn points within the given time. If shown a reverse sign, tilt the opposite direction', true);
		await speak('Time given will be shorter every 5 points earned. Good luck!', true);
		mode = 6;
	}
	if (mode === 7) {
		await speak('How to play', true);
		mode = 8;
		await speak('Shake the sphero as fast as you can until you hear "Stop".', true);
		await speak('Place it on the floor and let it roll. The harder you shake, the further the distance.', true);
		mode = 9;
	}
}
registerEvent(EventType.onLanding, onLanding);


//Speed Tilt game
async function speedTilt() {
	resetAim();
	setStabilization(false);
	await Sound.Game.Points.play(true);
	await delay(0.4);
	await speak('You chose to play Speed Tilt', true);
	await speak(buildString('Throw up to hear instructions.'), true);
	mode = 4;
	await delay(3);
	if (mode !== 4) {
		while (!(mode === 6)) {
			await delay(0.3);
			await delay(0.025);
		}
	}
	await delay(0.3);
	mode = 6;
	await newgame();
	while (true) {
		if (score > 7) {
			move_to_do = getRandomInt(1, 2);
		}
		heading_to_do = getRandomFloat(1, 4);
		setHeading(heading_to_do * 90);
		await delay(0.2);
		playMatrixAnimation(0, false);
		if (move_to_do === 1) {
			await delay(0.1);
		}
		if (move_to_do === 2) {
			playMatrixAnimation(1, false);
			await delay(0.5);
			playMatrixAnimation(0, false);
		}
		setStabilization(false);
		timer = getElapsedTime();
		await detectmove();
		await delay(0.025);
	}
}

// detect move made in Speed Tilt
async function detectmove() {
	if (score < 20) {
		if (score === next5) {
			next5 = next5 + 5;
			delay_timer = delay_timer - 0.4;
		}
	}
	while (!(move_made !== 0 || getElapsedTime() >= timer + delay_timer)) {
		if (getOrientation().pitch > 40) {
			move_made = 1;
		}
		if (getOrientation().pitch < -40) {
			move_made = 2;
		}
		if (getOrientation().roll < -30 || getOrientation().roll > 30) {
			await fail();
		}
		await delay(0.025);
	}
	if (move_made === move_to_do) {
		await Sound.Game.Notification.play(false);
		score = score + 1;
		move_made = 0;
		heading_to_do = 0;
		setBackLed(0);
		await delay(0.2);
	} else {
		await fail();
	}
}

// start a round of Speed Tilt
async function newgame() {
	await speak(buildString('Here we go!'), false);
	await fade({ r: 0, g: 0, b: 0 }, { r: 0, g: 255, b: 0 }, 1.2);
	await delay(0.8);
	await Sound.Effects.Click.play(false);
	await fade({ r: 0, g: 255, b: 0 }, { r: 0, g: 170, b: 0 }, 1);
	await Sound.Effects.Click.play(false);
	await fade({ r: 0, g: 170, b: 0 }, { r: 0, g: 85, b: 0 }, 1);
	await Sound.Effects.Click.play(false);
	await fade({ r: 0, g: 85, b: 0 }, { r: 0, g: 0, b: 0 }, 1);
	await Sound.Game.Coin.play(false);
	setHeading(0);
}

//when player loses in Speed Tilt
async function fail() {
	setBackLed(0);
	playMatrixAnimation(9, false);
	setMainLed({ r: 255, g: 11, b: 29 });
	await Sound.EightBit.Hit.play(true);
	await fade({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }, 0.6);
	setHeading(0);
	await delay(0.25);
	setStabilization(false);
	if (score === 1) {
		await speak(buildString('You scored 1 point.'), false);
		await scrollMatrixText('1', { r: 5, g: 255, b: 46 }, 20, false);
	} else {
		await speak(buildString('You scored', score, 'points.'), false);
		await scrollMatrixText(buildString(score), { r: 5, g: 255, b: 46 }, 20, false);
	}
	next5 = 5;
	score = 0;
	delay_timer = 3;
	timer = 0;
	move_made = 0;
	heading_to_do = 0;
	move_to_do = 1;
	await delay(0.7);
	setHeading(0);
	await delay(1);
	await speak(buildString('Ready?'), true);
	await delay(0.3);
	setStabilization(false);
	await newgame();
}

//Bomber game
async function bomber() {
	setMainLed({ r: 158, g: 35, b: 21 });
	setStabilization(false);
	await Sound.Game.Points.play(true);
	await delay(0.4);
	await speak('You chose to play Bomber', true);
	playMatrixAnimation(2, true);
	await delay(2);
	await scrollMatrixText('Bomb!', { r: 158, g: 35, b: 21 }, 15, true);
	setMainLed({ r: 158, g: 35, b: 21 });
	lives = 3;
	score = 0;
	await speak('Throw up to hear instructions.', true);
	mode = 2;
	await delay(2);
	if (mode !== 2) {
		while (!(mode === 1)) {
			await delay(0.3);
			await delay(0.025);
		}
	}
	mode = 1;
	while (true) {
		await scrollMatrixText('Ready...', { r: 225, g: 29, b: 197 }, 15, true);
		await speak('Game Start', true);
		playMatrixAnimation(3, false);
		await delay(getRandomInt(2, 3));
		playMatrixAnimation(4, false);
		await delay(getRandomInt(0.1, 2));
		playMatrixAnimation(5, false);
		await delay(getRandomInt(0.1, 2));
		bomb = true;
		explode = false;
		playMatrixAnimation(2, false);
		await delay(getRandomInt(1, 2));
		if (bomb === true) {
			explode = true;
			await Sound.Effects.Explosion.play(false);
			playMatrixAnimation(6, false);
			await delay(2);
			clearMatrix();
			setMainLed({ r: 158, g: 35, b: 21 });
			if (lives === 3) {
				lives = 2;
				await speak(buildString(2, 'lives remaining.'), true);
			} else {
				if (lives === 2) {
					lives = 1;
					await speak(buildString(1, 'life remaining.'), true);
				} else {
					lives = 0;
					await speak(buildString(0, 'lives remaing.'), true);
				}
			}
			if (lives === 0) {
				playMatrixAnimation(7, true);
				await Sound.Game.YouLose.play(true);
				setMatrixCharacter(buildString(score), { r: 166, g: 18, b: 24 });
				await speak(buildString('Your final score is', score, 'bombs avoided.'), true);
				await delay(1.5);
				await start();
			}
		} else {
			clearMatrix();
			playMatrixAnimation(8, true);
			await Sound.Game.LevelUp.play(true);
			score = score + 1;
			await speak('You avoided the bomb.', true);
			await speak(buildString('Your current score is', score, 'bombs avoided.'), true);
			clearMatrix();
		}
		setMainLed({ r: 158, g: 35, b: 21 });
		await delay(1);
		await delay(0.025);
	}
}

// when in midair for Bomber game
async function onFreefall() {
	if (mode === 1 || explode === false) {
		bomb = false;
	}
}
registerEvent(EventType.onFreefall, onFreefall);

//Punch Game
async function punch() {
	resetAim();
	setStabilization(false);
	await Sound.Game.Points.play(true);
	await delay(0.4);
	await speak('You chose to play Punch', true);
	await speak(buildString('Throw up to hear instructions.'), true);
	mode = 7;
	await delay(3);
	if (mode !== 7) {
		while (!(mode === 9)) {
			await delay(0.3);
			await delay(0.025);
		}
	}
	await delay(0.3);
	mode = 9;
	await speak('Start', true);
}


//detect strength of punch
async function onGyroMax() {
	if (mode === 9) {
		setFrontLed({ r: 46, g: 227, b: 255 });
		resetAim();
		setStabilization(false);
		timer = 0;
		vel = 0;
		total = 0;
		setMainLed({ r: 83, g: 255, b: 53 });
		while (!(timer > 5)) {
			total = total + Math.sqrt((getVelocity().x ** 2) + (getVelocity().y ** 2));
			await delay(1);
			timer = timer + 1;
			await delay(0.025);
		}
		setMainLed({ r: 255, g: 33, b: 76 });
		await speak('Stop', true);
		await scrollMatrixText(buildString('Total', total), { r: 154, g: 255, b: 146 }, 15, false);
		power = total / 5;
		await speak('Place Sphero on floor', true);
		distb4 = Math.sqrt((getLocation().x ** 2) + (getLocation().y ** 2));
		await delay(2);
		await roll(0, power, 5);
		await speak(buildString('Your sphero has travelled', Math.sqrt((getLocation().x ** 2) + (getLocation().y ** 2)) - distb4, 'cm'), true);
	}
}
registerEvent(EventType.onGyroMax, onGyroMax);

//Animations
registerMatrixAnimation({
	frames: [[[2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2], [8, 8, 8, 8, 8, 8, 8, 8], [8, 8, 8, 8, 8, 8, 8, 8], [8, 8, 8, 8, 8, 8, 8, 8], [8, 8, 8, 8, 8, 8, 8, 8]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 14, 1, 1, 14, 1, 1], [1, 1, 14, 1, 1, 14, 14, 1], [1, 1, 14, 1, 1, 14, 1, 14], [1, 1, 14, 1, 1, 14, 1, 1], [1, 1, 14, 1, 1, 14, 1, 1], [14, 1, 14, 1, 1, 14, 1, 1], [1, 14, 14, 1, 1, 14, 1, 1], [1, 1, 14, 1, 1, 14, 1, 1]], [[1, 1, 14, 1, 1, 14, 1, 1], [1, 1, 14, 1, 1, 14, 14, 1], [1, 1, 14, 1, 1, 14, 1, 14], [1, 1, 14, 1, 1, 14, 1, 1], [1, 1, 14, 1, 1, 14, 1, 1], [14, 1, 14, 1, 1, 14, 1, 1], [1, 14, 14, 1, 1, 14, 1, 1], [1, 1, 14, 1, 1, 14, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[6, 6, 6, 6, 6, 6, 2, 2], [6, 6, 6, 6, 6, 2, 6, 6], [6, 6, 1, 1, 2, 1, 6, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 6, 1, 1, 1, 1, 6, 6]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[13, 13, 8, 8, 8, 8, 13, 13], [13, 8, 8, 13, 13, 8, 8, 13], [13, 8, 8, 13, 13, 8, 8, 13], [13, 8, 8, 13, 13, 8, 8, 13], [13, 13, 13, 13, 8, 8, 13, 13], [13, 13, 13, 8, 8, 13, 13, 13], [13, 13, 13, 13, 13, 13, 13, 13], [13, 13, 13, 8, 8, 13, 13, 13]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 120, g: 2, b: 1 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[6, 6, 2, 2, 2, 2, 6, 6], [6, 2, 2, 6, 6, 2, 2, 6], [6, 2, 2, 6, 6, 2, 2, 6], [6, 2, 2, 6, 6, 2, 2, 6], [6, 6, 6, 6, 2, 2, 6, 6], [6, 6, 6, 2, 2, 6, 6, 6], [6, 6, 6, 6, 6, 6, 6, 6], [6, 6, 6, 2, 2, 6, 6, 6]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 254, g: 255, b: 194 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 120, g: 2, b: 1 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[7, 7, 11, 11, 11, 11, 7, 7], [7, 11, 11, 7, 7, 11, 11, 7], [7, 11, 11, 7, 7, 11, 11, 7], [7, 11, 11, 7, 7, 11, 11, 7], [7, 7, 7, 7, 11, 11, 7, 7], [7, 7, 7, 11, 11, 7, 7, 7], [7, 7, 7, 7, 7, 7, 7, 7], [7, 7, 7, 11, 11, 7, 7, 7]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 254, g: 255, b: 194 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 120, g: 2, b: 1 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[6, 6, 6, 6, 6, 6, 2, 2], [6, 6, 6, 6, 6, 2, 6, 6], [6, 6, 1, 1, 2, 1, 6, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 1, 1, 1, 1, 1, 1, 6], [6, 6, 1, 1, 1, 1, 6, 6]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 4, 4, 1, 1, 1], [1, 1, 1, 4, 4, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 8, 8, 8, 8, 8, 8, 1], [1, 8, 6, 6, 6, 6, 8, 1], [1, 8, 6, 4, 4, 6, 8, 1], [1, 8, 6, 4, 4, 6, 8, 1], [1, 8, 6, 6, 6, 6, 8, 1], [1, 8, 8, 8, 8, 8, 8, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[2, 2, 2, 2, 2, 2, 2, 2], [2, 8, 8, 8, 8, 8, 8, 2], [2, 8, 6, 6, 6, 6, 8, 2], [2, 8, 6, 4, 4, 6, 8, 2], [2, 8, 6, 4, 4, 6, 8, 2], [2, 8, 6, 6, 6, 6, 8, 2], [2, 8, 8, 8, 8, 8, 8, 2], [2, 2, 2, 2, 2, 2, 2, 2]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 1, 1, 0, 1, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 1, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1], [1, 0, 1, 0, 1, 0, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 1, 0, 1, 1, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 0, 0, 0, 0, 1], [1, 1, 0, 1, 0, 1, 0, 1]], [[1, 1, 0, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 1, 1, 0, 1, 1, 0], [1, 0, 0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 0, 0, 0, 0, 1], [1, 1, 0, 1, 0, 1, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 0, 0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 1, 1, 0, 1, 1, 0, 1], [0, 0, 0, 0, 0, 0, 0, 1], [0, 0, 0, 1, 0, 0, 0, 1], [1, 0, 0, 0, 0, 0, 1, 1], [1, 0, 1, 0, 1, 0, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 1, 1, 1, 1, 1, 1, 1], [6, 1, 1, 1, 1, 1, 1, 6], [1, 6, 1, 1, 1, 1, 6, 1], [1, 1, 6, 6, 6, 6, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 1, 1, 1, 1, 1, 1, 1], [6, 1, 1, 1, 1, 1, 1, 6], [1, 6, 1, 1, 1, 1, 6, 1], [1, 1, 6, 6, 6, 6, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 1, 1, 1, 1, 1, 1, 1], [6, 1, 1, 1, 1, 1, 1, 6], [1, 6, 1, 1, 1, 1, 6, 1], [1, 1, 6, 6, 6, 6, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 1, 1, 1, 1, 1, 1, 1], [6, 1, 1, 1, 1, 1, 1, 6], [1, 6, 1, 1, 1, 1, 6, 1], [1, 1, 6, 6, 6, 6, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 1, 1, 1, 1, 1, 1, 1], [6, 1, 1, 1, 1, 1, 1, 6], [1, 6, 1, 1, 1, 1, 6, 1], [1, 1, 6, 6, 6, 6, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 6, 6, 1, 1, 6, 6, 1], [1, 1, 1, 1, 1, 1, 1, 1], [6, 1, 1, 1, 1, 1, 1, 6], [1, 6, 1, 1, 1, 1, 6, 1], [1, 1, 6, 6, 6, 6, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[2, 2, 1, 1, 1, 1, 2, 2], [2, 2, 2, 1, 1, 2, 2, 2], [1, 2, 2, 2, 2, 2, 2, 1], [1, 1, 2, 2, 2, 2, 1, 1], [1, 1, 2, 2, 2, 2, 1, 1], [1, 2, 2, 2, 2, 2, 2, 1], [2, 2, 2, 1, 1, 2, 2, 2], [2, 2, 1, 1, 1, 1, 2, 2]], [[2, 2, 1, 1, 1, 1, 2, 2], [2, 2, 2, 1, 1, 2, 2, 2], [1, 2, 2, 2, 2, 2, 2, 1], [1, 1, 2, 2, 2, 2, 1, 1], [1, 1, 2, 2, 2, 2, 1, 1], [1, 2, 2, 2, 2, 2, 2, 1], [2, 2, 2, 1, 1, 2, 2, 2], [2, 2, 1, 1, 1, 1, 2, 2]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
