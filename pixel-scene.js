<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Пиксельный персонаж</title>
  <style>
    body {
      margin: 0;
      background-color: #1a1a1a;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    canvas {
      image-rendering: pixelated;
      border: 2px solid #333;
      background-color: #2b2b2b;
    }
  </style>
</head>
<body>
  <canvas id="gameCanvas" width="16" height="16"></canvas>

  <script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // Увеличиваем отображение (масштаб x6)
    const scale = 6;
    canvas.style.width = canvas.width * scale + "px";
    canvas.style.height = canvas.height * scale + "px";

    // Утилита — пиксельный "карандаш"
    function drawPixel(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }

    function drawCharacter() {
      // Очистка
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Волосы
      drawPixel(7, 2, "#3a2c20");
      drawPixel(8, 2, "#3a2c20");

      // Лицо
      drawPixel(7, 3, "#fcbf9d");
      drawPixel(8, 3, "#fcbf9d");
      drawPixel(7, 4, "#fcbf9d");
      drawPixel(8, 4, "#fcbf9d");

      // Тело (рубашка)
      drawPixel(6, 5, "#2c4a78");
      drawPixel(7, 5, "#2c4a78");
      drawPixel(8, 5, "#2c4a78");
      drawPixel(9, 5, "#2c4a78");

      drawPixel(6, 6, "#2c4a78");
      drawPixel(7, 6, "#2c4a78");
      drawPixel(8, 6, "#2c4a78");
      drawPixel(9, 6, "#2c4a78");

      // Руки
      drawPixel(5, 6, "#2c4a78");
      drawPixel(10, 6, "#2c4a78");

      // Штаны
      drawPixel(6, 7, "#1a1a1a");
      drawPixel(7, 7, "#1a1a1a");
      drawPixel(8, 7, "#1a1a1a");
      drawPixel(9, 7, "#1a1a1a");

      // Обувь
      drawPixel(6, 8, "#555");
      drawPixel(9, 8, "#555");
    }

    drawCharacter();
  </script>
</body>
</html>