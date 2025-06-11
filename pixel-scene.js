<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Пиксельный персонаж</title>
  <style>
    body {
      background: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    canvas {
      image-rendering: pixelated;
      border: 2px solid #333;
      background-color: #2b2b2b;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="64" height="64"></canvas>

  <script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const scale = 6; // масштаб для телефона
    canvas.style.width = canvas.width * scale + "px";
    canvas.style.height = canvas.height * scale + "px";

    // Функция рисует персонажа пикселями
    function drawPixel(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }

    function drawCharacter() {
      ctx.clearRect(0, 0, 64, 64);

      // Голова
      drawPixel(30, 10, "#fcbf9d"); // лицо
      drawPixel(31, 10, "#fcbf9d");
      drawPixel(30, 11, "#fcbf9d");
      drawPixel(31, 11, "#fcbf9d");

      // Волосы
      drawPixel(30, 9, "#3a2c20");
      drawPixel(31, 9, "#3a2c20");

      // Тело (рубашка)
      for (let y = 12; y <= 17; y++) {
        drawPixel(29, y, "#2c4a78");
        drawPixel(30, y, "#2c4a78");
        drawPixel(31, y, "#2c4a78");
        drawPixel(32, y, "#2c4a78");
      }

      // Руки
      drawPixel(28, 13, "#2c4a78");
      drawPixel(33, 13, "#2c4a78");

      // Штаны
      for (let y = 18; y <= 20; y++) {
        drawPixel(29, y, "#1a1a1a");
        drawPixel(30, y, "#1a1a1a");
        drawPixel(31, y, "#1a1a1a");
        drawPixel(32, y, "#1a1a1a");
      }

      // Обувь
      drawPixel(29, 21, "#555");
      drawPixel(32, 21, "#555");
    }

    drawCharacter();
  </script>
</body>
</html>