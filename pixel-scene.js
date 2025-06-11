const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scale = 2; // масштаб пикселя

function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * scale, y * scale, scale, scale);
}

function clearScene() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Простой силуэт леса
function drawForest(offset) {
  for (let i = 0; i < 256; i += 8) {
    let height = 10 + (Math.sin((i + offset) / 10) * 5);
    ctx.fillStyle = "#050";
    ctx.fillRect(i, 80 + height, 4, 40);
  }
}

// Простое окно
function drawWindow(x, y, offset) {
  ctx.fillStyle = "#003";
  ctx.fillRect(x * scale, y * scale, 32, 24);
  drawForest(offset);
}

// Сиденье
function drawSeat(x, y) {
  ctx.fillStyle = "#444";
  ctx.fillRect(x * scale, y * scale, 12, 8);
}

// Персонаж в 8-бит стиле
function drawCharacter(x, y, breathing) {
  const sprite = [
    "00100",
    "01110",
    "11111",
    "00100",
    "01110",
    "10101",
    "00100",
    "01010"
  ];
  for (let row = 0; row < sprite.length; row++) {
    for (let col = 0; col < sprite[row].length; col++) {
      if (sprite[row][col] === "1") {
        drawPixel(x + col, y + row + breathing, "#ccc");
      }
    }
  }
}

let t = 0;
function render() {
  clearScene();

  // Пол
  ctx.fillStyle = "#222";
  ctx.fillRect(0, 150, canvas.width, 42);

  // Окна с прокруткой фона
  drawWindow(5, 5, t);
  drawWindow(16, 5, t + 30);

  // Сиденья
  drawSeat(8, 15);
  drawSeat(20, 15);
  drawSeat(4, 17);
  drawSeat(24, 17);

  // Персонаж
  const breath = Math.sin(t / 10) > 0 ? 0 : 1;
  drawCharacter(12, 11, breath);

  t++;
  requestAnimationFrame(render);
}

render();