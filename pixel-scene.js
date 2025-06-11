const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scale = 2; // каждый "пиксель" — 2x2

function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

function clear() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Силуэты леса за окном
function drawForest() {
  for (let i = 0; i < 256; i += 8) {
    let height = 20 + Math.random() * 10;
    ctx.fillStyle = "#0a0";
    ctx.fillRect(i, 90, 4, height);
  }
}

// Простое окно
function drawWindow(x, y) {
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 12; j++) {
      drawPixel(x + i, y + j, "#003");
    }
  }
  drawForest();
}

// Сиденье
function drawSeat(x, y) {
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 4; j++) {
      drawPixel(x + i, y + j, "#444");
    }
  }
}

// Персонаж — условный человечек
function drawCharacter(x, y, offset = 0) {
  const body = [
    "00100",
    "01110",
    "11111",
    "00100",
    "01110",
    "10101",
    "00100",
    "01010"
  ];

  for (let row = 0; row < body.length; row++) {
    for (let col = 0; col < body[row].length; col++) {
      if (body[row][col] === "1") {
        drawPixel(x + col, y + row + offset, "#ccc");
      }
    }
  }
}

let t = 0;
function drawScene() {
  clear();

  // Пол
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 150, canvas.width, 42);

  // Окна
  drawWindow(10, 10);
  drawWindow(130, 10);

  // Сиденья
  drawSeat(30, 130);
  drawSeat(190, 130);

  // Персонаж
  let breath = Math.sin(t / 10) > 0 ? 0 : 1;
  drawCharacter(110, 100, breath);

  t++;
  requestAnimationFrame(drawScene);
}

drawScene();