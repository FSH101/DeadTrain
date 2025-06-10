body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Segoe UI', sans-serif;
  background: #000;
  color: #fff;
  overflow: hidden;
}

.background {
  position: fixed;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  background: url('../assets/background.gif') center center / cover no-repeat;
  z-index: 1;
  opacity: 0.2;
  animation: float 30s linear infinite;
}

@keyframes float {
  0% { background-position-x: 0; }
  100% { background-position-x: -1000px; }
}

.overlay {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  text-align: center;
}

#wagon-content {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid #444;
  border-radius: 10px;
  padding: 30px;
  max-width: 600px;
  transition: opacity 0.5s;
}

.options button {
  background: #222;
  color: #fff;
  border: none;
  padding: 12px 24px;
  margin: 10px 5px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.options button:hover {
  background: #444;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 0.8s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}