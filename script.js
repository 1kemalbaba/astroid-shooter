const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameActive = false;
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const menuElement = document.getElementById('menu');
const gameElement = document.getElementById('game');

highScoreDisplay.textContent = highScore;
gameElement.style.display = 'none';

const ship = {
  x: canvas.width / 2,
  y: canvas.height - 50,
  size: 20,
  trail: []
};

let asteroids = [];
let lasers = [];

document.getElementById('startGame').addEventListener('click', () => {
  gameActive = true;
  menuElement.classList.add('menu-hidden');
  gameElement.style.display = 'block';
  score = 0;
  scoreDisplay.textContent = score;
  update();
});

function createAsteroid() {
  const size = Math.random() * 30 + 20;
  asteroids.push({
    x: Math.random() * canvas.width,
    y: -size,
    size: size,
    speed: Math.random() * 3 + 1,
    rotation: Math.random() * Math.PI * 2,
    vertices: Math.floor(Math.random() * 3) + 6
  });
}

function drawShip() {
  // Add trail effect
  ship.trail.unshift({ x: ship.x, y: ship.y + ship.size });
  if (ship.trail.length > 10) ship.trail.pop();
  
  ship.trail.forEach((pos, i) => {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, (ship.size/4) * (1 - i/10), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 255, 204, ${0.3 * (1 - i/10)})`;
    ctx.fill();
  });

  ctx.beginPath();
  ctx.moveTo(ship.x, ship.y - ship.size);
  ctx.lineTo(ship.x - ship.size, ship.y + ship.size);
  ctx.lineTo(ship.x + ship.size, ship.y + ship.size);
  ctx.closePath();
  ctx.fillStyle = '#00ffcc';
  ctx.shadowBlur = 20;
  ctx.shadowColor = '#00ffcc';
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawAsteroid(asteroid) {
  ctx.save();
  ctx.translate(asteroid.x, asteroid.y);
  ctx.rotate(asteroid.rotation);
  
  ctx.beginPath();
  for(let i = 0; i < asteroid.vertices; i++) {
    const angle = (Math.PI * 2 * i) / asteroid.vertices;
    const radius = asteroid.size * (0.8 + Math.random() * 0.2);
    ctx.lineTo(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius
    );
  }
  ctx.closePath();
  ctx.fillStyle = '#ff00ff';
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff00ff';
  ctx.fill();
  ctx.restore();
  
  asteroid.rotation += 0.02;
}

function drawLaser(laser) {
  ctx.beginPath();
  ctx.moveTo(laser.x, laser.y);
  ctx.lineTo(laser.x, laser.y - 15);
  ctx.strokeStyle = '#ffff00';
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ffff00';
  ctx.lineWidth = 3;
  ctx.stroke();
  
 
  ctx.beginPath();
  ctx.arc(laser.x, laser.y - 7, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffff00';
  ctx.fill();
}

canvas.addEventListener('mousemove', (e) => {
  if (!gameActive) return;
  const rect = canvas.getBoundingClientRect();
  ship.x = e.clientX - rect.left;
});

canvas.addEventListener('click', () => {
  if (!gameActive) return;
  lasers.push({ x: ship.x, y: ship.y - ship.size, speed: 7 });
});

function gameOver() {
  gameActive = false;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
    highScoreDisplay.textContent = highScore;
  }
  menuElement.classList.remove('menu-hidden');
  gameElement.style.display = 'none';
  asteroids = [];
  lasers = [];
}

function update() {
  if (!gameActive) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawShip();

  if (Math.random() < 0.05) createAsteroid();
  
  asteroids.forEach((asteroid, i) => {
    asteroid.y += asteroid.speed;
    drawAsteroid(asteroid);
    if (asteroid.y - asteroid.size > canvas.height) asteroids.splice(i, 1);

    if (Math.hypot(asteroid.x - ship.x, asteroid.y - ship.y) < asteroid.size + ship.size) {
      gameOver();
      return;
    }
  });

  lasers.forEach((laser, li) => {
    laser.y -= laser.speed;
    drawLaser(laser);
    if (laser.y < 0) lasers.splice(li, 1);

    asteroids.forEach((asteroid, ai) => {
      if (Math.hypot(laser.x - asteroid.x, laser.y - asteroid.y) < asteroid.size) {
        asteroids.splice(ai, 1);
        lasers.splice(li, 1);
        score += 10;
        scoreDisplay.textContent = score;
      }
    });
  });

  requestAnimationFrame(update);
}
