let player;
let enemies = [];
let bullets = [];
let gravityDir = 0; // 0: abajo, 1: arriba, 2: derecha, 3: izquierda
let lastShift = 0;
let score = 0;

function setup() {
  createCanvas(600, 600);
  player = new Player();
  rectMode(CENTER);
}

function draw() {
  background(20);
  
  // Temporizador para cambio de gravedad (cada 7 segundos)
  if (millis() - lastShift > 7000) {
    gravityDir = floor(random(4));
    lastShift = millis();
    shakeScreen();
  }

  // Dibujar UI
  fill(255);
  textSize(20);
  text(`Puntos: ${score}`, 20, 30);
  text(`Siguiente cambio: ${ceil(7 - (millis() - lastShift)/1000)}s`, 20, 60);

  // Actualizar Jugador
  player.update();
  player.show();

  // Gestión de Balas
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].show();
    if (bullets[i].offScreen()) bullets.splice(i, 1);
  }

  // Gestión de Enemigos
  if (frameCount % 60 == 0) enemies.push(new Enemy());
  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].update();
    enemies[i].show();

    // Colisión con Bala
    for (let j = bullets.length - 1; j >= 0; j--) {
      if (enemies[i] && bullets[j].hits(enemies[i])) {
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        break;
      }
    }

    // Colisión con Jugador
    if (enemies[i] && enemies[i].hits(player)) {
      noLoop();
      alert("GAME OVER - Score: " + score);
      window.location.reload();
    }
  }
}

function mousePressed() {
  bullets.push(new Bullet(player.pos.x, player.pos.y));
}

function shakeScreen() {
  translate(random(-10, 10), random(-10, 10));
}

// --- CLASES DEL JUEGO ---

class Player {
  constructor() {
    this.pos = createVector(width/2, height/2);
    this.vel = createVector(0, 0);
    this.size = 25;
  }

  update() {
    let force = 0.5;
    // Aplicar gravedad según dirección
    if (gravityDir === 0) this.vel.y += force;
    if (gravityDir === 1) this.vel.y -= force;
    if (gravityDir === 2) this.vel.x += force;
    if (gravityDir === 3) this.vel.x -= force;

    // Controles WASD
    if (keyIsDown(65)) this.vel.x -= 0.5; // A
    if (keyIsDown(68)) this.vel.x += 0.5; // D
    if (keyIsDown(87)) this.vel.y -= 0.5; // W
    if (keyIsDown(83)) this.vel.y += 0.5; // S

    this.pos.add(this.vel);
    this.vel.mult(0.95); // Fricción

    // Colisiones con bordes
    this.pos.x = constrain(this.pos.x, this.size, width - this.size);
    this.pos.y = constrain(this.pos.y, this.size, height - this.size);
  }

  show() {
    fill(0, 200, 255);
    stroke(255);
    push();
    translate(this.pos.x, this.pos.y);
    // Girar visualmente según gravedad
    if (gravityDir === 1) rotate(PI);
    if (gravityDir === 2) rotate(-HALF_PI);
    if (gravityDir === 3) rotate(HALF_PI);
    rect(0, 0, this.size, this.size, 5);
    pop();
  }
}

class Bullet {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.sub(createVector(mouseX, mouseY), this.pos).setMag(10);
  }
  update() { this.pos.add(this.vel); }
  show() { fill(255, 255, 0); noStroke(); ellipse(this.pos.x, this.pos.y, 8); }
  offScreen() { return (this.pos.x<0 || this.pos.x>width || this.pos.y<0 || this.pos.y>height); }
  hits(target) { return dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) < 20; }
}

class Enemy {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
  }
  update() {
    let dir = p5.Vector.sub(player.pos, this.pos).setMag(2);
    this.pos.add(dir);
  }
  show() { fill(255, 50, 50); rect(this.pos.x, this.pos.y, 20, 20); }
  hits(target) { return dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) < 25; }
}
