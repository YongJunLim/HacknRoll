var move_to_do = 1;
var heading_to_do = 0;
var move_made = 0;
var timer = 0;
var delay_timer = 3;
var score = 0;
var next5 = 5;


async function startProgram() {
	setStabilization(false);
	await Sound.Game.Points.play(true);
	await delay(0.4);
	await speak(buildString('Are you ready to play Speed Tilt?'), true);
	await delay(0.3);
	await newgame();
	while (true) {
		if (score > 7) {
			move_to_do = getRandomInt(1, 2);
		}
		heading_to_do = getRandomInt(1, 4);
		setHeading(heading_to_do * 90);
		await delay(0.2);
		playMatrixAnimation(0, false);
		if (move_to_do === 2) {
			playMatrixAnimation(1, false);
			await delay(0.5);
			playMatrixAnimation(0, false);
		} else {
			await delay(0.1);
		}
		setStabilization(false);
		timer = getElapsedTime();
		await detectmove();
		await delay(0.025);
	}
}

async function fail() {
	setBackLed(0);
	playMatrixAnimation(2, false);
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

registerMatrixAnimation({
	frames: [[[2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 2, 2], [8, 8, 8, 8, 8, 8, 8, 8], [8, 8, 8, 8, 8, 8, 8, 8], [8, 8, 8, 8, 8, 8, 8, 8], [8, 8, 8, 8, 8, 8, 8, 8]]],
	palette: [{ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, { r: 255, g: 64, b: 0 }, { r: 255, g: 128, b: 0 }, { r: 255, g: 191, b: 0 }, { r: 255, g: 255, b: 0 }, { r: 185, g: 246, b: 30 }, { r: 0, g: 255, b: 0 }, { r: 185, g: 255, b: 255 }, { r: 0, g: 255, b: 255 }, { r: 0, g: 0, b: 255 }, { r: 145, g: 0, b: 211 }, { r: 157, g: 48, b: 118 }, { r: 255, g: 0, b: 255 }, { r: 204, g: 27, b: 126 }],
	fps: 10,
	transition: MatrixAnimationTransition.None
});
registerMatrixAnimation({
	frames: [[[1, 1, 1, 1, 14, 1, 1, 1], [1, 1, 1, 1, 1, 14, 1, 1], [1, 14, 14, 14, 14, 14, 14, 1], [1, 14, 1, 1, 1, 14, 1, 1], [1, 14, 1, 1, 14, 1, 14, 1], [1, 14, 1, 1, 1, 1, 14, 1], [1, 14, 14, 14, 14, 14, 14, 1], [1, 1, 1, 1, 1, 1, 1, 1]], [[1, 1, 1, 1, 14, 1, 1, 1], [1, 1, 1, 1, 1, 14, 1, 1], [1, 14, 14, 14, 14, 14, 14, 1], [1, 14, 1, 1, 1, 14, 1, 1], [1, 14, 1, 1, 14, 1, 14, 1], [1, 14, 1, 1, 1, 1, 14, 1], [1, 14, 14, 14, 14, 14, 14, 1], [1, 1, 1, 1, 1, 1, 1, 1]]],
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
