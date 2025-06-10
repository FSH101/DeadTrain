async function loadWagon(id) {
  const container = document.getElementById("wagon-content");
  container.classList.remove("fade-in");
  await new Promise(r => setTimeout(r, 200)); // пауза перед сменой

  try {
    const res = await fetch(`wagons/wagon${id}.json`);
    const wagon = await res.json();

    document.getElementById("wagon-title").textContent = wagon.title;
    document.getElementById("wagon-description").textContent = wagon.description;
    document.getElementById("wagon-question").textContent = wagon.question;

    const optionsContainer = document.getElementById("wagon-options");
    optionsContainer.innerHTML = '';

    wagon.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt.text;
      btn.onclick = () => loadWagon(opt.next);
      optionsContainer.appendChild(btn);
    });

    container.classList.add("fade-in");
  } catch (err) {
    document.getElementById("wagon-title").textContent = "Ошибка загрузки";
    document.getElementById("wagon-description").textContent = "";
    document.getElementById("wagon-question").textContent = "";
    document.getElementById("wagon-options").innerHTML = "";
  }
}

// Старт с первого вагона
loadWagon(1);