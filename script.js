const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let cw, ch;
function resizeCanvas() {
  cw = canvas.width = window.innerWidth;
  ch = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const fireworks = [];
const particles = [];
const letters = [];
const stars = [];
const planets = [];
const message = "DOĞUM GÜNÜN KUTLU OLSUN";
const finalMessage = "SENİ ÇÖPTEN BULALI 14 YIL OLDU :)";  // 15. patlamada gösterilecek mesaj

const opts = {
  fireworkInterval: 2000,
  gravity: 0.2,
  colors: ["red", "yellow", "blue", "green", "purple", "orange", "white"],
};

let lastFirework = 0;
let fireworkCount = 0;
const maxFireworks = 15;
let finalMessageTriggered = false;  // 15. patlama kontrolü için

// Yıldızlar (Daha fazla yıldız ekleyelim)
for (let i = 0; i < 300; i++) {  // Yıldız sayısını artırdım
  stars.push({
    x: Math.random() * cw,
    y: Math.random() * ch,
    radius: Math.random() * 2.5,  // Yıldızların boyutunu artırdım
    alpha: Math.random(),
    delta: (Math.random() * 0.02) + 0.005
  });
}

// Gezegenler
planets.push({ x: cw * 0.3, y: ch * 0.3, radius: 50, angle: 0, speed: 0.01, color: 'cyan' });
planets.push({ x: cw * 0.7, y: ch * 0.5, radius: 40, angle: 0.015, speed: 0.015, color: 'pink' });
planets.push({ x: cw * 0.5, y: ch * 0.7, radius: 60, angle: 0.008, speed: 0.008, color: 'orange' });

class Firework {
  constructor(x) {
    this.x = x;
    this.y = ch;
    this.targetY = Math.random() * (ch / 3);
    this.speed = 10;
    this.exploded = false;
    this.color = randomColor();
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        this.explode();
      }
    }
  }

  explode() {
    this.exploded = true;
    createParticles(this.x, this.y);
    createLetters(this.x, this.y);
  }

  draw() {
    if (!this.exploded) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 8;
    this.vy = (Math.random() - 0.5) * 8;
    this.alpha = 1;
    this.color = randomColor();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.alpha -= 0.02;
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class Letter {
  constructor(x, y, char) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.color = randomColor();
    this.size = 50;  // Yazı boyutunu 50px yaptık
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = Math.random() * 1 + 1;
    this.alpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.05;
    this.alpha -= 0.002;
  }

  draw() {
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.font = `bold ${this.size}px Arial`;  // Yazı boyutunu değiştirdik
    ctx.fillText(this.char, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

function createLetters(x, y) {
  const spacing = 35;
  const startX = x - (message.length * spacing) / 2;

  for (let i = 0; i < message.length; i++) {
    letters.push(new Letter(startX + i * spacing, y, message[i]));
  }
}

function createParticles(x, y) {
  for (let i = 0; i < 80; i++) {
    particles.push(new Particle(x, y));
  }
}

function randomColor() {
  return opts.colors[Math.floor(Math.random() * opts.colors.length)];
}

function drawStars() {
  stars.forEach(star => {
    star.alpha += star.delta;
    if (star.alpha <= 0 || star.alpha >= 1) star.delta *= -1;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
    ctx.fill();
  });
}

function drawPlanets() {
  planets.forEach(planet => {
    planet.angle += planet.speed;
    const orbitRadius = 30;
    const offsetX = Math.cos(planet.angle) * orbitRadius;
    const offsetY = Math.sin(planet.angle) * orbitRadius;

    ctx.beginPath();
    ctx.arc(planet.x + offsetX, planet.y + offsetY, planet.radius, 0, Math.PI * 2);
    ctx.fillStyle = planet.color;
    ctx.fill();
  });
}

function animate(timestamp) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fillRect(0, 0, cw, ch);

  drawStars();
  drawPlanets();

  if (fireworkCount < maxFireworks) {
    if (timestamp - lastFirework > opts.fireworkInterval) {
      fireworks.push(new Firework(Math.random() * cw));
      lastFirework = timestamp;
      fireworkCount++;
    }
  }

  fireworks.forEach((fw, i) => {
    fw.update();
    fw.draw();
    if (fw.exploded) fireworks.splice(i, 1);
  });

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw();
    if (p.alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  for (let i = letters.length - 1; i >= 0; i--) {
    const l = letters[i];
    l.update();
    l.draw();
    if (l.alpha <= 0) {
      letters.splice(i, 1);
    }
  }

  // 15. patlama yazısı ve büyüme efekti
  if (fireworkCount === maxFireworks && !finalMessageTriggered) {
    finalMessageTriggered = true;
    createLetters(cw / 2, ch / 2); // Final mesajını başlat
  }

  // Final mesajı büyümesi ve ekrana sığması
  if (finalMessageTriggered) {
    const fontSize = Math.min(Math.min(cw, ch) / finalMessage.length, 300);  // Yazı boyutunu ekrana sığdırıyoruz
    ctx.fillStyle = "white";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillText(finalMessage, cw / 2 - ctx.measureText(finalMessage).width / 2, ch / 2);
  }

  requestAnimationFrame(animate);
}

animate();
