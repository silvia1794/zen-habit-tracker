document.addEventListener('DOMContentLoaded', () => {
    const DAILY_BUDGET = 30;

    // Etichette precise per i tuoi 10 bicchieri
    const waterLabels = [
        "Sveglia", "Sveglia", 
        "Colazione", "Metà mattina", 
        "Pre-pranzo", "Pranzo", 
        "Pomeriggio", "Pomeriggio", 
        "Pre-cena", "Cena"
    ];

    // --- FUNZIONI DI SUPPORTO DATE ---
    function getTodayString() {
        // Restituisce la data in formato YYYY-MM-DD
        return new Date().toISOString().split('T')[0];
    }

    function calculateDaysDifference(dateString1, dateString2) {
        const date1 = new Date(dateString1);
        const date2 = new Date(dateString2);
        const diffTime = Math.abs(date2 - date1);
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // --- INIZIALIZZAZIONE E LOGICA GIORNALIERA ---
    let appData = JSON.parse(localStorage.getItem('zenRoomData')) || {
        lastLogin: null,
        budget: 0,
        waterLog: Array(10).fill(false), // 10 bicchieri, false = non bevuto
        studyDone: null // null, 'Studio', 'Lezione', o 'Simulazione'
    };

    const today = getTodayString();

    if (appData.lastLogin !== today) {
        let daysPassed = 1;
        
        if (appData.lastLogin === null) {
            // Primo avvio in assoluto
            appData.budget = DAILY_BUDGET;
        } else {
            // Sono passati dei giorni dall'ultimo login
            daysPassed = calculateDaysDifference(appData.lastLogin, today);
            appData.budget += (DAILY_BUDGET * daysPassed);
            
            // Reset abitudini giornaliere
            appData.waterLog = Array(10).fill(false);
            appData.studyDone = null;
        }
        
        appData.lastLogin = today;
        saveData();
    }

    function saveData() {
        localStorage.setItem('zenRoomData', JSON.stringify(appData));
    }

    // --- LOGICA BUDGET (Maneki-Neko) ---
    const budgetAmountEl = document.getElementById('budget-amount');
    const expenseInput = document.getElementById('expense-input');
    const spendBtn = document.getElementById('spend-btn');

    function updateBudgetUI() {
        budgetAmountEl.innerText = `€ ${appData.budget.toFixed(2)}`;
        // Cambia colore se in rosso
        budgetAmountEl.style.color = appData.budget < 0 ? '#d97e7e' : 'var(--accent-color)';
    }

    spendBtn.addEventListener('click', () => {
        const expense = parseFloat(expenseInput.value);
        if (!isNaN(expense) && expense > 0) {
            appData.budget -= expense;
            expenseInput.value = '';
            saveData();
            updateBudgetUI();
        }
    });

    updateBudgetUI();

    // --- LOGICA STUDIO (Chabudai) ---
    const studyControls = document.getElementById('study-controls');
    const studyStamp = document.getElementById('study-stamp');
    const studyResultText = document.getElementById('study-result-text');
    const studyButtons = document.querySelectorAll('.study-btn');

    function updateStudyUI() {
        if (appData.studyDone) {
            studyControls.classList.add('hidden');
            studyStamp.classList.remove('hidden');
            studyResultText.innerText = `Oggi hai completato: ${appData.studyDone}`;
        } else {
            studyControls.classList.remove('hidden');
            studyStamp.classList.add('hidden');
        }
    }

    studyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            appData.studyDone = e.target.dataset.type;
            saveData();
            updateStudyUI();
        });
    });

    updateStudyUI();

    // --- LOGICA ACQUA (I 10 Bicchieri in Fiori) ---
    const waterGrid = document.getElementById('water-grid');

    function renderWaterGrid() {
        waterGrid.innerHTML = ''; // Pulisce la griglia
        
        waterLabels.forEach((label, index) => {
            const item = document.createElement('div');
            item.className = 'water-item';
            
            const isDrunk = appData.waterLog[index];
            const icon = isDrunk ? '🌸' : '🍵';
            const iconClass = isDrunk ? 'sakura-icon cup-icon' : 'cup-icon';
            
            item.innerHTML = `
                <div class="${iconClass}">${icon}</div>
                <div class="water-label">${label}</div>
            `;
            
            // Se non è stato bevuto, aggiungiamo il click
            if (!isDrunk) {
                item.addEventListener('click', () => {
                    appData.waterLog[index] = true;
                    saveData();
                    renderWaterGrid(); // Ri-disegna per mostrare il fiore
                });
            } else {
                item.style.cursor = 'default';
            }
            
            waterGrid.appendChild(item);
        });
    }

    renderWaterGrid();
});