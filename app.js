
const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const quarts = ['Matin', 'Après-midi', 'Soirée', 'Nuit'];
const parents = ['none', 'moi', 'ana'];

function initWeekGrids() {
  document.querySelectorAll('.week-grid').forEach(grid => {
    const type = grid.dataset.weekType;
    const data = loadWeekType(type);

    grid.innerHTML = '';
    jours.forEach((jour, j) => {
      const label = document.createElement('div');
      label.className = 'day-label';
      label.textContent = jour;
      grid.appendChild(label);

      quarts.forEach((quart, q) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        const key = `${j}-${q}`;
        const owner = data[key] || 'none';
        cell.dataset.owner = owner;
        cell.textContent = getOwnerLabel(owner);

        cell.addEventListener('click', () => {
          const current = cell.dataset.owner;
          const next = getNextOwner(current);
          cell.dataset.owner = next;
          cell.textContent = getOwnerLabel(next);
          saveWeekType(type, { ...data, [key]: next });
        });

        grid.appendChild(cell);
      });
    });
  });
}

function getNextOwner(current) {
  const index = parents.indexOf(current);
  return parents[(index + 1) % parents.length];
}

function getOwnerLabel(owner) {
  if (owner === 'none') return '';
  const moi = localStorage.getItem('parent_moi') || 'Moi';
  const ana = localStorage.getItem('parent_ana') || 'Ana';
  return owner === 'moi' ? moi : ana;
}

function loadWeekType(type) {
  return JSON.parse(localStorage.getItem(`semaine_type_${type}`)) || {};
}

function saveWeekType(type, data) {
  localStorage.setItem(`semaine_type_${type}`, JSON.stringify(data));
  generateMonthPreview(); // mise à jour automatique
}

// --------------------------------
// Prévisualisation mensuelle
// --------------------------------
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function generateMonthPreview() {
  const container = document.getElementById('monthGrid');
  const label = document.getElementById('monthLabel');
  const first = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

  label.textContent = `${first.toLocaleString('fr-FR', { month: 'long' })} ${currentYear}`;
  container.innerHTML = '';

  const typePaire = loadWeekType('paire');
  const typeImpaire = loadWeekType('impaire');

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(currentYear, currentMonth, d);
    const dayOfWeek = (date.getDay() + 6) % 7; // Lundi = 0
    const weekNumber = getISOWeekNumber(date);
    const type = weekNumber % 2 === 0 ? typePaire : typeImpaire;

    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';

    const header = document.createElement('div');
    header.className = 'day-header';
    header.textContent = `${d}/${currentMonth + 1}`;
    dayDiv.appendChild(header);

    for (let q = 0; q < 4; q++) {
      const key = `${dayOfWeek}-${q}`;
      const owner = type[key] || 'none';
      const seg = document.createElement('div');
      seg.className = 'segment';
      seg.dataset.owner = owner;
      seg.textContent = getOwnerLabel(owner);
      dayDiv.appendChild(seg);
    }

    container.appendChild(dayDiv);
  }
}

// Calcul ISO week number
function getISOWeekNumber(date) {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return 1 + Math.round(((tmp - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// Navigation mois
document.addEventListener('click', (e) => {
  if (e.target.id === 'prevMonth') {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    generateMonthPreview();
  }

  if (e.target.id === 'nextMonth') {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    generateMonthPreview();
  }
});

// Initialisation
if (location.hash === '#planning') {
  setTimeout(() => {
    initWeekGrids();
    generateMonthPreview();
  }, 100);
}
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('segment-cell')) {
    e.target.classList.toggle('active');
    e.target.textContent = e.target.classList.contains('active') ? '✓' : '–';

    // Optionnel : tu peux stocker les valeurs dans localStorage ici
    const day = e.target.dataset.jour;
    const weekType = e.target.dataset.type;
    const part = e.target.dataset.part;
    const isActive = e.target.classList.contains('active');
    // Exemple : localStorage.setItem(`garde-${weekType}-${day}-${part}`, isActive);
  }
});
