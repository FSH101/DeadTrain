let currentWagonId = 1;
let currentStepIndex = 0;
let wagonData = null;

// Загружаем вагон по ID
async function loadWagon(id) {
    const response = await fetch(`wagons/wagon${id}.json`);
    wagonData = await response.json();
    currentStepIndex = 0;
    renderCurrentStep();
}

// Показываем текущий шаг
function renderCurrentStep() {
    const step = wagonData.steps[currentStepIndex];
    const container = document.getElementById('train-container');
    container.innerHTML = ''; // очищаем

    if (!step) return;

    if (step.type === 'text') {
        const p = document.createElement('p');
        p.textContent = step.content;
        p.className = 'step-text';
        container.appendChild(p);

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Далее';
        nextBtn.className = 'next-btn';
        nextBtn.onclick = () => {
            currentStepIndex++;
            renderCurrentStep();
        };
        container.appendChild(nextBtn);

    } else if (step.type === 'question') {
        const q = document.createElement('p');
        q.textContent = step.question;
        q.className = 'step-question';
        container.appendChild(q);

        step.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.text;
            btn.className = 'option-btn';
            btn.onclick = () => {
                currentStepIndex = opt.nextStep;
                renderCurrentStep();
            };
            container.appendChild(btn);
        });

    } else if (step.type === 'end') {
        loadWagon(step.gotoWagon);
    }
}

// Начинаем игру с первого вагона
window.onload = () => {
    loadWagon(currentWagonId);
};