const STORAGE_KEY = "gymTrackerData";

const DEFAULT_DATA = {
  routineDays: [],
  workouts: [],
  bodyWeightHistory: [],
  goal: "",
  future: {
    calories: null,
    sleep: null,
    sync: null,
    exportImport: null,
    charts: null,
    profiles: null,
  },
};

const state = {
  data: loadData(),
  section: "home",
  selectedTrainingDayId: null,
  activeWorkout: null,
  activeExerciseId: null,
  editingDayId: null,
  editingExercise: null,
  editingSet: null,
  chartSlides: {},
  routineView: { screen: "list", dayId: null, addMode: null },
  progressView: { screen: "groups", group: null, exerciseKey: null },
  catalogPicker: null,
  exerciseDrafts: {},
};

const app = document.querySelector("#app");
const screenTitle = document.querySelector("#screenTitle");
const toast = document.querySelector("#toast");
const dialog = document.querySelector("#confirmDialog");
const confirmTitle = document.querySelector("#confirmTitle");
const confirmMessage = document.querySelector("#confirmMessage");
const sectionTitles = {
  home: "Inicio",
  routine: "Rutina",
  train: "Entrenar",
  progress: "Progreso",
  profile: "Perfil",
};

const PROGRESS_GROUPS = ["Pecho", "Espalda", "Bíceps", "Tríceps", "Hombro", "Pierna", "Glúteo", "Abdomen", "Antebrazo", "Otros"];

const MUSCLE_GROUP_ALIASES = {
  pecho: "Pecho",
  espalda: "Espalda",
  biceps: "Bíceps",
  bíceps: "Bíceps",
  triceps: "Tríceps",
  tríceps: "Tríceps",
  hombro: "Hombro",
  hombros: "Hombro",
  pierna: "Pierna",
  piernas: "Pierna",
  gluteo: "Glúteo",
  glúteo: "Glúteo",
  gluteos: "Glúteo",
  glúteos: "Glúteo",
  abdomen: "Abdomen",
  abdominales: "Abdomen",
  core: "Abdomen",
  antebrazo: "Antebrazo",
  antebrazos: "Antebrazo",
  "pecho alto": "Pecho",
  "pecho medio": "Pecho",
  "pecho bajo": "Pecho",
  dorsal: "Espalda",
  "espalda media": "Espalda",
  "espalda baja": "Espalda",
  trapecio: "Espalda",
  "biceps general": "Bíceps",
  "bíceps general": "Bíceps",
  "cabeza larga": "Bíceps",
  "cabeza corta": "Bíceps",
  braquial: "Bíceps",
  "triceps general": "Tríceps",
  "tríceps general": "Tríceps",
  "cabeza larga de triceps": "Tríceps",
  "cabeza larga de tríceps": "Tríceps",
  "cabeza lateral": "Tríceps",
  "cabeza lateral de triceps": "Tríceps",
  "cabeza lateral de tríceps": "Tríceps",
  "cabeza medial": "Tríceps",
  "cabeza medial de triceps": "Tríceps",
  "cabeza medial de tríceps": "Tríceps",
  "deltoide anterior": "Hombro",
  "deltoide lateral": "Hombro",
  "deltoide posterior": "Hombro",
  cuadriceps: "Pierna",
  cuádriceps: "Pierna",
  isquios: "Pierna",
  gemelos: "Pierna",
  aductores: "Pierna",
  abductores: "Pierna",
  "gluteo mayor": "Glúteo",
  "glúteo mayor": "Glúteo",
  "gluteo medio": "Glúteo",
  "glúteo medio": "Glúteo",
  "abdomen superior": "Abdomen",
  "abdomen inferior": "Abdomen",
  oblicuos: "Abdomen",
  flexores: "Antebrazo",
  extensores: "Antebrazo",
  agarre: "Antebrazo",
};

const EXERCISE_CATALOG = {
  Pecho: {
    "Pecho alto": ["Press inclinado con mancuernas", "Press inclinado con barra", "Aperturas inclinadas"],
    "Pecho medio": ["Press banca", "Press con mancuernas en banco plano", "Aperturas en banco plano"],
    "Pecho bajo": ["Fondos en paralelas", "Press declinado", "Cruces en polea alta"],
  },
  Espalda: {
    Dorsal: ["Jalón al pecho", "Dominadas", "Pullover en polea"],
    "Espalda media": ["Remo con barra", "Remo sentado en polea", "Remo con mancuerna"],
    "Espalda baja": ["Peso muerto rumano", "Hiperextensiones", "Buenos días"],
    Trapecio: ["Encogimientos con mancuernas", "Face pulls", "Remo al mentón"],
  },
  Bíceps: {
    "Bíceps general": ["Curl con barra", "Curl con mancuernas", "Curl en polea"],
    "Cabeza larga": ["Curl inclinado con mancuernas", "Curl martillo", "Curl bayesian en polea"],
    "Cabeza corta": ["Curl predicador", "Curl concentrado", "Curl con barra Z"],
    Braquial: ["Curl martillo", "Curl inverso", "Curl en cuerda"],
  },
  Tríceps: {
    "Tríceps general": ["Jalón de tríceps en polea", "Press cerrado", "Fondos en banco"],
    "Cabeza larga": ["Extensión de tríceps por encima de la cabeza", "Extensión con mancuerna a dos manos", "Extensión en polea alta por encima de la cabeza"],
    "Cabeza lateral": ["Jalón con cuerda", "Jalón con barra recta", "Patada de tríceps"],
    "Cabeza medial": ["Jalón inverso", "Press cerrado", "Extensión en polea con agarre supino"],
  },
  Hombro: {
    "Deltoide anterior": ["Press militar", "Press Arnold", "Elevaciones frontales"],
    "Deltoide lateral": ["Elevaciones laterales", "Elevaciones laterales en polea", "Press con mancuernas"],
    "Deltoide posterior": ["Pájaros con mancuernas", "Face pulls", "Reverse pec deck"],
  },
  Pierna: {
    Cuádriceps: ["Sentadilla", "Prensa", "Extensión de cuádriceps"],
    Isquios: ["Peso muerto rumano", "Curl femoral tumbado", "Curl femoral sentado"],
    Gemelos: ["Elevación de gemelos de pie", "Elevación de gemelos sentado", "Gemelos en prensa"],
    Aductores: ["Máquina de aductores", "Sentadilla sumo", "Zancada lateral"],
    Abductores: ["Máquina de abductores", "Caminata lateral con banda", "Abducción de cadera en polea"],
  },
  Glúteo: {
    "Glúteo mayor": ["Hip thrust", "Peso muerto rumano", "Sentadilla profunda"],
    "Glúteo medio": ["Abducción de cadera", "Caminata lateral con banda", "Patada lateral en polea"],
  },
  Abdomen: {
    "Abdomen superior": ["Crunch", "Crunch en máquina", "Crunch en polea"],
    "Abdomen inferior": ["Elevaciones de piernas", "Crunch inverso", "Rodillas al pecho"],
    Oblicuos: ["Plancha lateral", "Giros rusos", "Woodchopper en polea"],
    Core: ["Plancha", "Dead bug", "Pallof press"],
  },
  Antebrazo: {
    Flexores: ["Curl de muñeca", "Curl de muñeca con barra", "Farmer walk"],
    Extensores: ["Curl inverso de muñeca", "Curl inverso con barra", "Extensión de muñeca con mancuerna"],
    Agarre: ["Farmer walk", "Dead hang", "Pinza con discos"],
  },
};

const CATALOG_EXERCISE_DETAILS = {
  "Press banca": {
    description: "Ejercicio básico para trabajar principalmente el pecho, con apoyo de hombro anterior y tríceps.",
    instructions: "Túmbate en el banco, baja la barra de forma controlada hasta el pecho y empuja manteniendo los hombros estables.",
    plannedSets: 4,
    targetReps: "8-10",
  },
  Plancha: {
    description: "Ejercicio isométrico para fortalecer el core y mejorar la estabilidad del tronco.",
    instructions: "Apoya antebrazos y puntas de los pies, mantén el cuerpo en línea recta y contrae el abdomen sin hundir la cadera.",
    plannedSets: 3,
    targetReps: "30-60 seg",
  },
  "Plancha lateral": {
    description: "Ejercicio isométrico para oblicuos, estabilidad lateral y control del core.",
    instructions: "Apoya un antebrazo, eleva la cadera y mantén el cuerpo alineado sin rotar el tronco.",
    plannedSets: 3,
    targetReps: "30-45 seg",
  },
  "Dead hang": {
    description: "Ejercicio simple para mejorar agarre, hombros y resistencia de antebrazo.",
    instructions: "Cuélgate de una barra con agarre firme, mantén hombros activos y controla la respiración durante el tiempo marcado.",
    plannedSets: 3,
    targetReps: "30-60 seg",
  },
};


function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeData(saved);
  } catch (error) {
    console.warn("No se pudieron cargar los datos locales", error);
    return structuredClone(DEFAULT_DATA);
  }
}

function normalizeData(saved) {
  return {
    ...structuredClone(DEFAULT_DATA),
    ...(saved && typeof saved === "object" ? saved : {}),
    routineDays: Array.isArray(saved?.routineDays) ? saved.routineDays : [],
    workouts: Array.isArray(saved?.workouts) ? saved.workouts : [],
    bodyWeightHistory: Array.isArray(saved?.bodyWeightHistory) ? saved.bodyWeightHistory : [],
    goal: typeof saved?.goal === "string" ? saved.goal : "",
  };
}

function saveData(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
  if (message) showToast(message);
  render();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function todayISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function formatDate(dateString) {
  if (!dateString) return "Sin fecha";
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${dateString}T00:00:00`));
}

function getSuggestedDayNumber(date = new Date()) {
  const day = date.getDay();
  return day >= 1 && day <= 5 ? day : null;
}

function getSuggestedRoutineDay() {
  const dayNumber = getSuggestedDayNumber();
  if (!dayNumber) return null;
  return state.data.routineDays.find((day) => Number(day.dayNumber) === dayNumber) || null;
}

function getTodayText() {
  const dayNumber = getSuggestedDayNumber();
  const routineDay = getSuggestedRoutineDay();
  return dayNumber && routineDay ? `Hoy toca: Día ${dayNumber} — ${routineDay.name}` : "Hoy es día de descanso";
}

function sortedRoutineDays() {
  return [...state.data.routineDays].sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#039;",
    '"': "&quot;",
  }[char]));
}

function navigate(section) {
  state.section = section;
  state.activeExerciseId = null;
  state.editingSet = null;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === section);
  });
  render();
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  screenTitle.textContent = sectionTitles[state.section];
  app.innerHTML = "";
  app.classList.remove("app-content");
  void app.offsetWidth;
  app.classList.add("app-content");

  if (state.data.routineDays.length === 0 && state.section === "home") {
    app.innerHTML = renderOnboarding();
    return;
  }

  const renderers = {
    home: renderHome,
    routine: renderRoutine,
    train: renderTrain,
    progress: renderProgress,
    profile: renderProfile,
  };
  app.innerHTML = renderers[state.section]();
}

function renderPreservingScroll(scrollY = window.scrollY) {
  render();
  requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: "auto" }));
}

function renderOnboarding() {
  return `
    <section class="empty-state">
      <div>
        <div class="empty-icon" aria-hidden="true">🏋️</div>
        <span class="chip">Empieza desde cero</span>
        <h2>Crea tu primera rutina</h2>
        <p>Define tus días de entrenamiento, añade ejercicios con instrucciones y registra tus series para medir tu progreso desde este dispositivo.</p>
        <button class="btn btn-primary" type="button" data-action="go-routine">Crear rutina</button>
      </div>
    </section>
  `;
}

function renderHome() {
  const workoutsThisWeek = getWorkoutsThisWeek().length;
  const lastWorkout = state.data.workouts.at(-1);
  const lastWeight = state.data.bodyWeightHistory.at(-1);
  const todayRoutine = getSuggestedRoutineDay();
  return `
    <section class="hero-card ${todayRoutine ? "" : "rest-card"}">
      ${todayRoutine ? `<span class="chip">Entrenamiento de hoy</span>` : ""}
      <h2 class="hero-title">${escapeHTML(getTodayText())}</h2>
      ${todayRoutine ? `
        <p class="hero-text">Tu rutina vive en este navegador con localStorage. No hay cuentas, backend ni datos compartidos entre dispositivos.</p>
        <button class="btn btn-primary" type="button" data-action="start-from-home">Empezar entrenamiento</button>
      ` : ""}
    </section>
    <section class="stats-grid">
      ${statCard("Semana", workoutsThisWeek, "entrenamientos registrados")}
      ${statCard("Último entrenamiento", lastWorkout ? `Día ${lastWorkout.dayNumber}` : "—", lastWorkout ? `${lastWorkout.dayName} · ${formatDate(lastWorkout.date)}` : "Aún no hay registros")}
      ${statCard("Peso actual", lastWeight ? `${lastWeight.weight} kg` : "—", lastWeight ? formatDate(lastWeight.date) : "Añádelo en Perfil")}
      ${statCard("Objetivo", state.data.goal || "Sin definir", "Editable en Perfil")}
    </section>
  `;
}

function statCard(label, value, note) {
  return `<article class="stat-card"><p class="stat-label">${escapeHTML(label)}</p><p class="stat-value">${escapeHTML(value)}</p><p class="stat-note">${escapeHTML(note)}</p></article>`;
}

function getWorkoutsThisWeek() {
  const now = new Date();
  const monday = new Date(now);
  const diff = (now.getDay() || 7) - 1;
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return state.data.workouts.filter((workout) => new Date(`${workout.date}T00:00:00`) >= monday);
}


function getExerciseDraft(dayId) {
  return state.exerciseDrafts[dayId] || null;
}

function setExerciseDraft(dayId, draft) {
  state.exerciseDrafts[dayId] = draft;
}

function clearExerciseDraft(dayId) {
  delete state.exerciseDrafts[dayId];
}

function getCatalogGroups() {
  return Object.keys(EXERCISE_CATALOG);
}

function getCatalogSubgroups(group) {
  return Object.keys(EXERCISE_CATALOG[group] || {});
}

function getCatalogExercises(group, subgroup) {
  return EXERCISE_CATALOG[group]?.[subgroup] || [];
}

function buildCatalogExercise(group, subgroup, exerciseName) {
  const custom = CATALOG_EXERCISE_DETAILS[exerciseName] || {};
  const specificMuscleGroup = getSpecificCatalogMuscleGroup(group, subgroup);
  return {
    name: exerciseName,
    muscleGroup: specificMuscleGroup,
    description: custom.description || `Ejercicio recomendado para trabajar ${specificMuscleGroup.toLowerCase()} dentro de ${group.toLowerCase()}.`,
    instructions: custom.instructions || `Realiza ${exerciseName.toLowerCase()} con técnica controlada, rango de movimiento cómodo y sin perder estabilidad durante la serie.`,
    plannedSets: "",
    targetReps: "",
  };
}

function getSpecificCatalogMuscleGroup(group, subgroup) {
  if (group === "Tríceps" && ["Cabeza larga", "Cabeza lateral", "Cabeza medial"].includes(subgroup)) {
    return `${subgroup} de tríceps`;
  }
  return subgroup;
}

function setRoutineView(screen, options = {}) {
  state.routineView = {
    screen,
    dayId: options.dayId ?? null,
    addMode: options.addMode ?? null,
  };
  if (screen !== "catalog") state.catalogPicker = null;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setProgressView(screen, options = {}) {
  state.progressView = {
    screen,
    group: options.group ?? null,
    exerciseKey: options.exerciseKey ?? null,
  };
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getRoutineDay(dayId) {
  return state.data.routineDays.find((day) => day.id === dayId) || null;
}

function renderRoutine() {
  const { screen, dayId } = state.routineView;
  const day = dayId ? getRoutineDay(dayId) : null;

  if ((screen === "detail" || screen === "add" || screen === "catalog") && !day) {
    state.routineView = { screen: "list", dayId: null, addMode: null };
    return renderRoutineList();
  }

  if (screen === "create") return renderDayEditor();
  if (screen === "detail") return renderDayDetail(day);
  if (screen === "add") return renderAddExerciseScreen(day);
  if (screen === "catalog") return renderCatalogScreen(day);
  return renderRoutineList();
}

function renderRoutineList() {
  const days = sortedRoutineDays();
  return `
    <section class="card form-card">
      <div>
        <span class="chip">Rutina personalizada</span>
        <h2>Tu rutina</h2>
        <p>Solo aparecen los días que tú has creado. La app no incluye ninguna rutina predeterminada.</p>
      </div>
      <button class="btn btn-primary" type="button" data-action="create-day-screen">Crear día</button>
    </section>
    ${days.length ? `
      <section class="grid">
        ${days.map(renderRoutineDayCard).join("")}
      </section>
    ` : `
      <section class="empty-state compact-empty">
        <div>
          <div class="empty-icon" aria-hidden="true">📋</div>
          <h2>Todavía no has creado tu rutina</h2>
          <p>Crea tu primer día de entrenamiento para empezar</p>
          <button class="btn btn-primary" type="button" data-action="create-day-screen">Crear día</button>
        </div>
      </section>
    `}
  `;
}

function renderRoutineDayCard(day) {
  return `
    <button class="routine-day-card" type="button" data-action="open-routine-day" data-day-id="${day.id}">
      <div>
        <p class="tiny">Día ${escapeHTML(day.dayNumber)}</p>
        <h2>${escapeHTML(day.name)}</h2>
        <p>${day.exercises.length} ${day.exercises.length === 1 ? "ejercicio" : "ejercicios"}</p>
      </div>
      <span>Ver día →</span>
    </button>
  `;
}

function renderDayEditor() {
  const editDay = state.data.routineDays.find((day) => day.id === state.editingDayId);
  const nextNumber = getNextDayNumber();
  return `
    <section class="screen-stack">
      <button class="btn btn-ghost" type="button" data-action="back-to-routine">← Rutina</button>
      <section class="card form-card">
        <div>
          <span class="chip">${editDay ? "Editar día" : "Nuevo día"}</span>
          <h2>${editDay ? "Editar nombre del día" : "Crear día de entrenamiento"}</h2>
          <p>El número se propone automáticamente, pero puedes ajustarlo si organizas tu rutina de otra forma.</p>
        </div>
        <form data-form="day" class="form-grid">
          <input type="hidden" name="id" value="${escapeHTML(editDay?.id || "")}" />
          <div class="field">
            <label for="dayNumber">Número de día</label>
            <input id="dayNumber" name="dayNumber" type="number" min="1" required value="${escapeHTML(editDay?.dayNumber || nextNumber)}" />
          </div>
          <div class="field">
            <label for="dayName">Nombre del día</label>
            <input id="dayName" name="name" type="text" placeholder="Pecho y tríceps" required value="${escapeHTML(editDay?.name || "")}" />
          </div>
          <button class="btn btn-primary full" type="submit">${editDay ? "Guardar cambios" : "Crear día"}</button>
          ${editDay ? `<button class="btn btn-ghost full" type="button" data-action="cancel-edit-day">Cancelar edición</button>` : ""}
        </form>
      </section>
    </section>
  `;
}

function getNextDayNumber() {
  const numbers = state.data.routineDays.map((day) => Number(day.dayNumber));
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

function renderDayDetail(day) {
  const editingDay = state.editingDayId === day.id;
  return `
    <section class="screen-stack">
      <button class="btn btn-ghost" type="button" data-action="back-to-routine">← Rutina</button>
      <section class="hero-card routine-detail-hero">
        <span class="chip">Día ${escapeHTML(day.dayNumber)}</span>
        <h2 class="hero-title">${escapeHTML(day.name)}</h2>
        <p>${day.exercises.length} ${day.exercises.length === 1 ? "ejercicio guardado" : "ejercicios guardados"}</p>
      </section>
      <div class="action-row">
        <button class="btn btn-primary" type="button" data-action="add-exercise-screen" data-day-id="${day.id}">Añadir ejercicio</button>
        <button class="btn btn-secondary" type="button" data-action="edit-day" data-day-id="${day.id}">Editar nombre</button>
        <button class="btn btn-danger" type="button" data-action="delete-day" data-day-id="${day.id}">Eliminar día</button>
      </div>
      ${editingDay ? renderDayNameEditor(day) : ""}
      <section class="grid">
        <div>
          <h2>Ejercicios</h2>
          <p class="tiny">Toca “Ver instrucciones” para abrir la guía de cada ejercicio.</p>
        </div>
        ${day.exercises.length ? day.exercises.map((exercise) => renderExerciseCard(day, exercise)).join("") : renderInlineEmpty("Este día todavía no tiene ejercicios.")}
      </section>
    </section>
  `;
}

function renderDayNameEditor(day) {
  return `
    <section class="card form-card">
      <div>
        <span class="chip">Editar día</span>
        <h2>Editar nombre del día</h2>
      </div>
      <form data-form="day" class="form-grid">
        <input type="hidden" name="id" value="${escapeHTML(day.id)}" />
        <div class="field">
          <label>Número de día</label>
          <input name="dayNumber" type="number" min="1" required value="${escapeHTML(day.dayNumber)}" />
        </div>
        <div class="field">
          <label>Nombre del día</label>
          <input name="name" type="text" required value="${escapeHTML(day.name)}" />
        </div>
        <button class="btn btn-primary full" type="submit">Guardar cambios</button>
        <button class="btn btn-ghost full" type="button" data-action="cancel-edit-day" data-day-id="${day.id}">Cancelar edición</button>
      </form>
    </section>
  `;
}

function renderExerciseCard(day, exercise) {
  return `
    <article class="exercise-card">
      <h3>${escapeHTML(exercise.name)}</h3>
      <div class="exercise-meta">
        <span class="pill accent">${escapeHTML(exercise.muscleGroup || "Sin grupo")}</span>
        <span class="pill">${escapeHTML(exercise.plannedSets || "—")} series</span>
        <span class="pill">${escapeHTML(exercise.targetReps || "—")} reps</span>
      </div>
      <details>
        <summary class="tiny">Ver instrucciones</summary>
        <p>${escapeHTML(exercise.description || "Sin descripción breve.")}</p>
        <p>${escapeHTML(exercise.instructions || "Añade instrucciones para convertir tu rutina en una guía personal.")}</p>
      </details>
      <div class="action-row">
        <button class="btn btn-ghost btn-small" type="button" data-action="edit-exercise" data-day-id="${day.id}" data-exercise-id="${exercise.id}">Editar</button>
        <button class="btn btn-danger btn-small" type="button" data-action="delete-exercise" data-day-id="${day.id}" data-exercise-id="${exercise.id}">Eliminar</button>
      </div>
    </article>
  `;
}

function renderAddExerciseScreen(day) {
  const { addMode } = state.routineView;
  const editing = state.editingExercise?.dayId === day.id;
  return `
    <section class="screen-stack">
      <button class="btn btn-ghost" type="button" data-action="back-to-day" data-day-id="${day.id}">← Día</button>
      <section class="card form-card">
        <span class="chip">Día ${escapeHTML(day.dayNumber)}</span>
        <h2>${editing ? "Editar ejercicio" : addMode === "manual" || getExerciseDraft(day.id) ? "Guardar ejercicio" : "Añadir ejercicio"}</h2>
        <p>${editing || addMode === "manual" || getExerciseDraft(day.id) ? "Revisa los datos antes de guardar. Los ejercicios del catálogo no se guardan automáticamente." : "Elige cómo quieres añadir el próximo ejercicio."}</p>
      </section>
      ${!editing && !addMode && !getExerciseDraft(day.id) ? renderAddExerciseOptions(day) : renderExerciseForm(day, true)}
    </section>
  `;
}

function renderAddExerciseOptions(day) {
  return `
    <section class="choice-grid">
      <button class="choice-card" type="button" data-action="open-catalog-screen" data-day-id="${day.id}">
        <strong>Escoger del catálogo</strong>
        <span>Guía por grupo muscular, zona y ejercicio recomendado.</span>
      </button>
      <button class="choice-card" type="button" data-action="manual-exercise-screen" data-day-id="${day.id}">
        <strong>Añadir manualmente</strong>
        <span>Escribe nombre, grupo, instrucciones, series y repeticiones.</span>
      </button>
    </section>
  `;
}

function renderCatalogScreen(day) {
  const picker = state.catalogPicker?.dayId === day.id ? state.catalogPicker : { dayId: day.id, step: "group", group: null, subgroup: null };
  state.catalogPicker = picker;
  const steps = { group: "Paso 1 de 3", subgroup: "Paso 2 de 3", exercise: "Paso 3 de 3" };
  const title = picker.step === "group" ? "Grupo muscular" : picker.step === "subgroup" ? "Zona" : "Ejercicio";
  const cards = renderCatalogStepCards(day, picker);
  return `
    <section class="screen-stack catalog-screen">
      <button class="btn btn-ghost" type="button" data-action="back-to-day" data-day-id="${day.id}">← Día ${escapeHTML(day.dayNumber)}</button>
      <section class="hero-card catalog-hero">
        <span class="chip">${steps[picker.step]}</span>
        <h2 class="hero-title">Escoge un ejercicio</h2>
        <p>${escapeHTML(title)}${picker.group ? ` · ${escapeHTML(picker.group)}` : ""}${picker.subgroup ? ` · ${escapeHTML(picker.subgroup)}` : ""}</p>
      </section>
      <div class="catalog-grid">${cards}</div>
      ${picker.step !== "group" ? `<button class="btn btn-secondary" type="button" data-action="catalog-back" data-day-id="${day.id}">← Volver al paso anterior</button>` : ""}
    </section>
  `;
}

function renderCatalogStepCards(day, picker) {
  if (picker.step === "group") {
    return getCatalogGroups().map((group) => `
      <button class="catalog-card" type="button" data-action="catalog-select-group" data-day-id="${day.id}" data-group="${escapeHTML(group)}">
        <strong>${escapeHTML(group)}</strong>
        <span>${getCatalogSubgroups(group).length} zonas disponibles</span>
      </button>
    `).join("");
  }

  if (picker.step === "subgroup") {
    return getCatalogSubgroups(picker.group).map((subgroup) => `
      <button class="catalog-card" type="button" data-action="catalog-select-subgroup" data-day-id="${day.id}" data-subgroup="${escapeHTML(subgroup)}">
        <strong>${escapeHTML(subgroup)}</strong>
        <span>${getCatalogExercises(picker.group, subgroup).length} ejercicios recomendados</span>
      </button>
    `).join("");
  }

  return getCatalogExercises(picker.group, picker.subgroup).map((exerciseName) => `
    <button class="catalog-card" type="button" data-action="catalog-select-exercise" data-day-id="${day.id}" data-exercise-name="${escapeHTML(exerciseName)}">
      <strong>${escapeHTML(exerciseName)}</strong>
      <span>Rellenar y revisar antes de guardar</span>
    </button>
  `).join("");
}

function renderExerciseForm(day, hideChooser = false) {
  const editing = state.editingExercise?.dayId === day.id ? day.exercises.find((exercise) => exercise.id === state.editingExercise.exerciseId) : null;
  const draft = !editing ? getExerciseDraft(day.id) : null;
  const values = editing || draft || {};
  return `
    <section class="card form-card">
      <div>
        <h3>${editing ? "Editar ejercicio" : draft ? "Revisar ejercicio" : "Añadir manualmente"}</h3>
        <p class="tiny">${draft ? "Datos cargados desde catálogo. Puedes editarlos antes de guardar." : "Completa los datos del ejercicio para este día."}</p>
      </div>
      <form data-form="exercise" data-day-id="${day.id}" class="form-grid">
        <input type="hidden" name="id" value="${escapeHTML(editing?.id || "")}" />
        <div class="field full">
          <label>Nombre del ejercicio</label>
          <input name="name" type="text" placeholder="Press banca" required value="${escapeHTML(values.name || "")}" />
        </div>
        <div class="field">
          <label>Grupo muscular</label>
          <input name="muscleGroup" type="text" placeholder="Pecho" value="${escapeHTML(values.muscleGroup || "")}" />
        </div>
        <div class="field">
          <label>Series previstas</label>
          <input name="plannedSets" type="number" min="1" placeholder="4" value="${escapeHTML(values.plannedSets || "")}" />
        </div>
        <div class="field full">
          <label>Repeticiones objetivo</label>
          <input name="targetReps" type="text" placeholder="8-10" value="${escapeHTML(values.targetReps || "")}" />
        </div>
        <div class="field full">
          <label>Descripción breve</label>
          <textarea name="description" placeholder="Ejercicio básico para trabajar el pecho.">${escapeHTML(values.description || "")}</textarea>
        </div>
        <div class="field full">
          <label>Instrucciones de ejecución</label>
          <textarea name="instructions" placeholder="Baja de forma controlada y empuja manteniendo estabilidad.">${escapeHTML(values.instructions || "")}</textarea>
        </div>
        <button class="btn btn-primary full" type="submit">Guardar ejercicio</button>
        ${editing ? `<button class="btn btn-ghost full" type="button" data-action="cancel-edit-exercise" data-day-id="${day.id}">Cancelar edición</button>` : ""}
      </form>
    </section>
  `;
}

function renderTrain() {
  if (state.activeWorkout) return renderActiveWorkout();
  const days = sortedRoutineDays();
  const suggested = getSuggestedRoutineDay();
  const selectedId = state.selectedTrainingDayId || suggested?.id || days[0]?.id || "";
  return `
    <section class="card workout-header">
      <span class="chip">Sesión activa</span>
      <h2>Elige un día para entrenar</h2>
      <p>${suggested ? `Sugerencia de hoy: Día ${suggested.dayNumber} — ${escapeHTML(suggested.name)}.` : "Hoy no hay sugerencia automática. Puedes elegir cualquier día creado."}</p>
      ${days.length ? `
        <div class="segmented">
          ${days.map((day) => `<button class="choice ${day.id === selectedId ? "active" : ""}" type="button" data-action="select-train-day" data-day-id="${day.id}"><strong>Día ${escapeHTML(day.dayNumber)}</strong><br><span class="tiny">${escapeHTML(day.name)}</span></button>`).join("")}
        </div>
        <button class="btn btn-primary" type="button" data-action="begin-workout" data-day-id="${selectedId}">Empezar entrenamiento</button>
      ` : `<button class="btn btn-primary" type="button" data-action="go-routine">Crear rutina</button>`}
    </section>
    ${!days.length ? renderEmpty("⚡", "No hay rutina disponible", "Crea al menos un día con ejercicios antes de iniciar un entrenamiento.") : ""}
  `;
}

function beginWorkout(dayId) {
  const day = state.data.routineDays.find((item) => item.id === dayId);
  if (!day) return showToast("Selecciona un día válido.");
  if (!day.exercises.length) return showToast("Añade ejercicios a este día antes de entrenar.");
  state.activeWorkout = {
    id: createId("workout"),
    date: todayISO(),
    dayNumber: day.dayNumber,
    dayName: day.name,
    exercises: day.exercises.map((exercise) => ({
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      instructions: exercise.instructions,
      plannedSets: exercise.plannedSets,
      targetReps: exercise.targetReps,
      sets: [],
    })),
  };
  render();
}

function renderActiveWorkout() {
  const workout = state.activeWorkout;
  const activeExercise = workout.exercises.find((exercise) => exercise.exerciseId === state.activeExerciseId);
  if (activeExercise) return renderExerciseLogger(activeExercise);
  return `
    <section class="hero-card">
      <span class="chip">Entrenamiento activo</span>
      <h2 class="hero-title">Día ${escapeHTML(workout.dayNumber)} — ${escapeHTML(workout.dayName)}</h2>
      <p>Abre cada ejercicio, registra tus series y finaliza cuando termines la sesión completa.</p>
    </section>
    <section class="grid">
      ${workout.exercises.map((exercise) => `
        <button class="exercise-card clickable" type="button" data-action="open-exercise-logger" data-exercise-id="${exercise.exerciseId}">
          <h3>${escapeHTML(exercise.name)}</h3>
          <p class="tiny">${escapeHTML(exercise.muscleGroup || "Sin grupo muscular")}</p>
          <div class="exercise-meta">
            <span class="pill accent">${exercise.sets.length} series guardadas</span>
            <span class="pill">Objetivo: ${escapeHTML(exercise.plannedSets || "—")} x ${escapeHTML(exercise.targetReps || "—")}</span>
          </div>
        </button>`).join("")}
    </section>
    <button class="btn btn-primary" type="button" data-action="finish-workout">Finalizar entrenamiento</button>
    <button class="btn btn-ghost" type="button" data-action="cancel-workout">Cancelar entrenamiento</button>
  `;
}

function renderExerciseLogger(exercise) {
  const nextSet = exercise.sets.length + 1;
  return `
    <section class="exercise-detail">
      <button class="btn btn-ghost" type="button" data-action="back-to-workout">← Volver a ejercicios</button>
      <article class="card">
        <span class="chip">Serie ${nextSet}</span>
        <h2>${escapeHTML(exercise.name)}</h2>
        <p>${escapeHTML(exercise.muscleGroup || "Sin grupo muscular")}</p>
        <p>${escapeHTML(exercise.instructions || "Registra el peso y las repeticiones de cada serie.")}</p>
        <form data-form="set" data-exercise-id="${exercise.exerciseId}" class="set-form">
          <div class="field">
            <label>Peso usado (kg)</label>
            <input name="weight" type="number" min="0" step="0.5" required inputmode="decimal" placeholder="60" />
          </div>
          <div class="field">
            <label>Repeticiones</label>
            <input name="reps" type="number" min="1" step="1" required inputmode="numeric" placeholder="10" />
          </div>
          <button class="btn btn-primary" type="submit">Guardar serie</button>
        </form>
      </article>
      <section class="grid">
        <h3>Series registradas</h3>
        ${exercise.sets.length ? exercise.sets.map((set, index) => renderSetRow(exercise, set, index)).join("") : renderInlineEmpty("Por defecto empiezas en Serie 1. Guarda la primera serie para verla aquí.")}
      </section>
      <button class="btn btn-secondary" type="button" data-action="add-another-set">Añadir otra serie</button>
    </section>
  `;
}

function renderSetRow(exercise, set, index) {
  const isEditing = state.editingSet?.exerciseId === exercise.exerciseId && Number(state.editingSet.setIndex) === index;
  if (isEditing) {
    return `
      <article class="set-row set-row-editing">
        <form data-form="edit-set" data-exercise-id="${exercise.exerciseId}" data-set-index="${index}" class="set-form edit-set-form">
          <strong>Editar serie ${set.setNumber}</strong>
          <div class="field">
            <label>Peso (kg)</label>
            <input name="weight" type="number" min="0" step="0.5" required inputmode="decimal" value="${escapeHTML(set.weight)}" />
          </div>
          <div class="field">
            <label>Repeticiones</label>
            <input name="reps" type="number" min="1" step="1" required inputmode="numeric" value="${escapeHTML(set.reps)}" />
          </div>
          <button class="btn btn-primary" type="submit">Guardar cambios</button>
          <button class="btn btn-ghost" type="button" data-action="cancel-edit-set">Cancelar</button>
        </form>
      </article>
    `;
  }

  return `
    <article class="set-row set-row-actions">
      <div>
        <strong>Serie ${set.setNumber}</strong>
        <span>${escapeHTML(set.weight)} kg x ${escapeHTML(set.reps)} reps</span>
      </div>
      <div class="set-actions">
        <button class="btn btn-ghost btn-small" type="button" data-action="edit-set" data-exercise-id="${exercise.exerciseId}" data-set-index="${index}">Editar</button>
        <button class="btn btn-danger btn-small" type="button" data-action="delete-set" data-exercise-id="${exercise.exerciseId}" data-set-index="${index}">Eliminar</button>
      </div>
    </article>
  `;
}

function renderProgress() {
  const summary = getProgressSummary();
  const { screen, group, exerciseKey } = state.progressView;

  if (!summary.totalSessions) return renderProgressEmpty();
  if (screen === "group") return renderProgressGroup(group, summary);
  if (screen === "exercise") return renderProgressExercise(group, exerciseKey, summary);
  return renderProgressGroups(summary);
}

function renderProgressEmpty() {
  return `
    <section class="empty-state">
      <div>
        <div class="empty-icon" aria-hidden="true">📈</div>
        <h2>Todavía no tienes entrenamientos registrados</h2>
        <p>Cuando guardes tus entrenamientos, podrás ver tu progreso aquí.</p>
      </div>
    </section>
  `;
}

function renderProgressGroups(summary) {
  return `
    <section class="card form-card">
      <span class="chip">Progreso</span>
      <h2>Elige un grupo muscular</h2>
      <p>Progreso se basa solo en entrenamientos guardados. Los ejercicios sin sesiones registradas no aparecen.</p>
    </section>
    <section class="progress-grid">
      ${PROGRESS_GROUPS.map((group) => {
        const count = summary.groups[group]?.exercises.length || 0;
        return `
          <button class="progress-card" type="button" data-action="progress-open-group" data-group="${escapeHTML(group)}">
            <strong>${escapeHTML(group)}</strong>
            <span>${count ? `${count} ${count === 1 ? "ejercicio registrado" : "ejercicios registrados"}` : "Sin registros todavía"}</span>
          </button>
        `;
      }).join("")}
    </section>
  `;
}

function renderProgressGroup(group, summary) {
  const safeGroup = PROGRESS_GROUPS.includes(group) ? group : "Otros";
  const exercises = summary.groups[safeGroup]?.exercises || [];
  return `
    <section class="screen-stack">
      <button class="btn btn-ghost" type="button" data-action="progress-back-groups">← Progreso</button>
      <section class="hero-card progress-hero">
        <span class="chip">Grupo muscular</span>
        <h2 class="hero-title">${escapeHTML(safeGroup)}</h2>
        <p>${exercises.length ? `${exercises.length} ${exercises.length === 1 ? "ejercicio registrado" : "ejercicios registrados"}` : `Todavía no hay entrenamientos registrados para ${escapeHTML(safeGroup)}`}</p>
      </section>
      ${exercises.length ? `
        <section class="grid">
          <h2>Ejercicios registrados</h2>
          ${exercises.map((exercise) => `
            <button class="progress-card" type="button" data-action="progress-open-exercise" data-group="${escapeHTML(safeGroup)}" data-exercise-key="${escapeHTML(exercise.key)}">
              <strong>${escapeHTML(exercise.name)}</strong>
              <span>${exercise.entries.length} ${exercise.entries.length === 1 ? "sesión" : "sesiones"} · último ${formatDate(exercise.last.date)}</span>
            </button>
          `).join("")}
        </section>
      ` : renderInlineEmpty("Todavía no hay entrenamientos registrados para este grupo")}
    </section>
  `;
}

function renderProgressExercise(group, exerciseKey, summary) {
  const safeGroup = PROGRESS_GROUPS.includes(group) ? group : "Otros";
  const exercise = summary.exerciseMap.get(exerciseKey);
  if (!exercise) return renderProgressGroup(safeGroup, summary);
  const progress = getExerciseProgressFromEntries(exercise.entries);
  return `
    <section class="screen-stack">
      <button class="btn btn-ghost" type="button" data-action="progress-back-group" data-group="${escapeHTML(safeGroup)}">← ${escapeHTML(safeGroup)}</button>
      <section class="hero-card progress-hero">
        <span class="chip">${escapeHTML(safeGroup)}</span>
        <h2 class="hero-title">${escapeHTML(exercise.name)}</h2>
        <p>${progress.entries.length} ${progress.entries.length === 1 ? "sesión registrada" : "sesiones registradas"}</p>
      </section>
      <section class="stats-grid">
        ${statCard("Último peso", `${progress.last.maxWeight} kg`, "máximo de la última sesión")}
        ${statCard("Mejor peso", `${progress.bestWeight} kg`, exercise.name)}
        ${statCard("Reps con mejor peso", progress.repsWithBestWeight, `${progress.bestWeight} kg`)}
        ${statCard("Veces entrenado", `${progress.entries.length} ${progress.entries.length === 1 ? "vez" : "veces"}`, "sesiones diferentes")}
        ${statCard("Último día", progress.last.dayName, formatDate(progress.last.date))}
        ${statCard("Evolución", progress.evolutionLabel, "vs. sesión anterior")}
      </section>
      ${renderChartCarousel(`progress-${exercise.key}`, "Evolución del peso máximo", progress.entries.map((entry) => ({ label: shortDate(entry.date), value: entry.maxWeight, note: `${entry.repsAtMax} reps` })), { unit: "kg", singleNote: "Necesitas más sesiones para ver una evolución clara.", emptyText: "Todavía no hay datos suficientes para generar la gráfica." })}
    </section>
  `;
}

function getProgressSummary() {
  const groups = Object.fromEntries(PROGRESS_GROUPS.map((group) => [group, { exercises: [] }]));
  const exerciseMap = new Map();
  let totalSessions = 0;

  state.data.workouts.forEach((workout, workoutIndex) => {
    if (!Array.isArray(workout.exercises)) return;
    workout.exercises.forEach((exercise) => {
      if (!Array.isArray(exercise.sets) || !exercise.sets.length) return;
      const sets = exercise.sets
        .map((set) => ({ weight: Number(set.weight), reps: Number(set.reps) }))
        .filter((set) => !Number.isNaN(set.weight) && !Number.isNaN(set.reps));
      if (!sets.length) return;

      const maxWeight = Math.max(...sets.map((set) => set.weight));
      const repsAtMax = Math.max(...sets.filter((set) => set.weight === maxWeight).map((set) => set.reps));
      const routineExercise = findRoutineExercise(exercise.exerciseId, exercise.name);
      const muscleGroup = normalizeMuscleGroup(exercise.muscleGroup || routineExercise?.muscleGroup);
      const key = exercise.exerciseId || `${normalizeText(exercise.name)}-${muscleGroup}`;
      const entry = {
        date: workout.date || "",
        dayName: workout.dayName || `Día ${workout.dayNumber || ""}`.trim(),
        maxWeight,
        repsAtMax,
        setCount: sets.length,
        workoutIndex,
      };

      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, {
          key,
          name: exercise.name || routineExercise?.name || "Ejercicio sin nombre",
          muscleGroup,
          entries: [],
        });
      }
      exerciseMap.get(key).entries.push(entry);
      totalSessions += 1;
    });
  });

  exerciseMap.forEach((exercise) => {
    exercise.entries.sort((a, b) => a.date.localeCompare(b.date) || a.workoutIndex - b.workoutIndex);
    exercise.last = exercise.entries.at(-1);
    groups[exercise.muscleGroup].exercises.push(exercise);
  });

  PROGRESS_GROUPS.forEach((group) => {
    groups[group].exercises.sort((a, b) => a.name.localeCompare(b.name, "es"));
  });

  return { groups, exerciseMap, totalSessions };
}

function normalizeMuscleGroup(value = "") {
  const normalized = normalizeText(value);
  return MUSCLE_GROUP_ALIASES[normalized] || "Otros";
}

function normalizeText(value = "") {
  return String(value).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function findRoutineExercise(exerciseId, exerciseName) {
  const allExercises = state.data.routineDays.flatMap((day) => day.exercises || []);
  return allExercises.find((exercise) => exercise.id === exerciseId)
    || allExercises.find((exercise) => normalizeText(exercise.name) === normalizeText(exerciseName))
    || null;
}

function getExerciseProgressFromEntries(entries) {
  const last = entries.at(-1);
  const previous = entries.at(-2);
  const bestWeight = Math.max(...entries.map((entry) => entry.maxWeight));
  const repsWithBestWeight = Math.max(...entries.filter((entry) => entry.maxWeight === bestWeight).map((entry) => entry.repsAtMax));
  const evolution = previous ? last.maxWeight - previous.maxWeight : null;
  const evolutionLabel = evolution === null ? "Sin datos suficientes" : evolution === 0 ? "Sin cambios" : `${evolution > 0 ? "+" : ""}${evolution} kg`;
  return { entries, last, previous, bestWeight, repsWithBestWeight, evolutionLabel };
}

function shortDate(dateString) {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "2-digit" }).format(new Date(`${dateString}T00:00:00`));
}

function renderChartCarousel(chartId, title, rawPoints, options = {}) {
  const points = rawPoints
    .map((point) => ({ ...point, value: Number(point.value) }))
    .filter((point) => !Number.isNaN(point.value));
  const activeIndex = Math.max(0, Math.min(1, state.chartSlides[chartId] || 0));
  const safeTitle = escapeHTML(title);
  const singleNote = points.length === 1 ? `<p class="chart-note">${escapeHTML(options.singleNote || "Necesitas más registros para ver una evolución clara.")}</p>` : "";

  if (!points.length) {
    return `
      <section class="card chart-card">
        <h2>${safeTitle}</h2>
        ${renderInlineEmpty(options.emptyText || "Todavía no hay datos suficientes para generar la gráfica.")}
      </section>
    `;
  }

  const slides = [
    { label: "Línea", html: renderLineChart(points, options) },
    { label: "Barras", html: renderBarChart(points, options) },
  ];

  return `
    <section class="card chart-card">
      <div class="chart-header">
        <div>
          <span class="chip">Gráficas</span>
          <h2>${safeTitle}</h2>
        </div>
        <div class="chart-arrows" aria-label="Cambiar gráfica">
          <button class="btn btn-ghost btn-small" type="button" data-action="chart-prev" data-chart-id="${escapeHTML(chartId)}">←</button>
          <button class="btn btn-ghost btn-small" type="button" data-action="chart-next" data-chart-id="${escapeHTML(chartId)}">→</button>
        </div>
      </div>
      ${singleNote}
      <div class="chart-carousel" data-chart-id="${escapeHTML(chartId)}" data-active-index="${activeIndex}">
        <div class="chart-track" style="transform: translateX(-${activeIndex * 100}%);">
          ${slides.map((slide) => `<article class="chart-slide"><h3>${slide.label}</h3>${slide.html}</article>`).join("")}
        </div>
      </div>
      <div class="chart-dots" aria-label="Indicadores de gráfica">
        ${slides.map((slide, index) => `<button class="chart-dot ${index === activeIndex ? "active" : ""}" type="button" data-action="chart-go" data-chart-id="${escapeHTML(chartId)}" data-chart-index="${index}" aria-label="Ver gráfica de ${slide.label}"></button>`).join("")}
      </div>
    </section>
  `;
}

function getChartBounds(points) {
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = maxValue === minValue ? Math.max(1, maxValue * 0.1) : (maxValue - minValue) * 0.12;
  return { min: Math.max(0, minValue - padding), max: maxValue + padding };
}

function chartY(value, bounds, height = 150, top = 18) {
  const range = bounds.max - bounds.min || 1;
  return top + (height - ((value - bounds.min) / range) * height);
}

function renderLineChart(points, options = {}) {
  const width = 320;
  const height = 210;
  const left = 32;
  const right = 14;
  const top = 18;
  const chartHeight = 150;
  const bounds = getChartBounds(points);
  const step = points.length > 1 ? (width - left - right) / (points.length - 1) : 0;
  const coords = points.map((point, index) => ({ x: points.length > 1 ? left + index * step : width / 2, y: chartY(point.value, bounds, chartHeight, top), point }));
  const polyline = coords.map((coord) => `${coord.x.toFixed(2)},${coord.y.toFixed(2)}`).join(" ");
  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfica de línea">
      <line class="chart-axis" x1="${left}" y1="${top + chartHeight}" x2="${width - right}" y2="${top + chartHeight}" />
      <line class="chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${top + chartHeight}" />
      <text class="chart-label" x="${left}" y="14">${formatChartValue(bounds.max, options.unit)}</text>
      ${coords.length > 1 ? `<polyline class="chart-line" points="${polyline}" />` : ""}
      ${coords.map((coord) => `
        <circle class="chart-point" cx="${coord.x}" cy="${coord.y}" r="4.5" />
        <text class="chart-value" x="${coord.x}" y="${Math.max(12, coord.y - 9)}" text-anchor="middle">${formatChartValue(coord.point.value, options.unit)}</text>
      `).join("")}
      ${renderChartDateLabels(coords, height)}
    </svg>
  `;
}

function renderBarChart(points, options = {}) {
  const width = 320;
  const height = 210;
  const left = 28;
  const right = 14;
  const top = 18;
  const chartHeight = 150;
  const bounds = getChartBounds(points);
  const slot = (width - left - right) / points.length;
  const barWidth = Math.max(14, Math.min(34, slot * 0.55));
  const coords = points.map((point, index) => {
    const y = chartY(point.value, bounds, chartHeight, top);
    const x = left + index * slot + (slot - barWidth) / 2;
    return { x, y, width: barWidth, height: top + chartHeight - y, point };
  });
  return `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfica de barras">
      <line class="chart-axis" x1="${left}" y1="${top + chartHeight}" x2="${width - right}" y2="${top + chartHeight}" />
      <text class="chart-label" x="${left}" y="14">${formatChartValue(bounds.max, options.unit)}</text>
      ${coords.map((coord) => `
        <rect class="chart-bar" x="${coord.x}" y="${coord.y}" width="${coord.width}" height="${Math.max(4, coord.height)}" rx="6" />
        <text class="chart-value" x="${coord.x + coord.width / 2}" y="${Math.max(12, coord.y - 8)}" text-anchor="middle">${formatChartValue(coord.point.value, options.unit)}</text>
      `).join("")}
      ${renderChartDateLabels(coords.map((coord) => ({ x: coord.x + coord.width / 2, point: coord.point })), height)}
    </svg>
  `;
}

function renderChartDateLabels(coords, height) {
  if (!coords.length) return "";
  if (coords.length === 1) return `<text class="chart-label" x="${coords[0].x}" y="${height - 8}" text-anchor="middle">${escapeHTML(coords[0].point.label)}</text>`;
  return coords.map((coord, index) => {
    if (coords.length > 5 && index !== 0 && index !== coords.length - 1 && index % 2 !== 0) return "";
    return `<text class="chart-label" x="${coord.x}" y="${height - 8}" text-anchor="middle">${escapeHTML(coord.point.label)}</text>`;
  }).join("");
}

function formatChartValue(value, unit = "") {
  const formatted = Number.isInteger(value) ? value : Number(value).toFixed(1).replace(/\.0$/, "");
  return `${formatted}${unit ? ` ${unit}` : ""}`;
}

function setChartSlide(chartId, index) {
  const nextIndex = Math.max(0, Math.min(1, index));
  state.chartSlides[chartId] = nextIndex;
  document.querySelectorAll(".chart-carousel").forEach((carousel) => {
    if (carousel.dataset.chartId !== chartId) return;
    carousel.dataset.activeIndex = String(nextIndex);
    const track = carousel.querySelector(".chart-track");
    if (track) track.style.transform = `translateX(-${nextIndex * 100}%)`;
    const card = carousel.closest(".chart-card");
    card?.querySelectorAll(".chart-dot").forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === nextIndex);
    });
  });
}

function renderProfile() {
  const lastWeight = state.data.bodyWeightHistory.at(-1);
  return `
    <section class="card form-card">
      <span class="chip">Medidas</span>
      <h2>Peso corporal</h2>
      <p>Último peso registrado: <strong>${lastWeight ? `${lastWeight.weight} kg · ${formatDate(lastWeight.date)}` : "sin datos"}</strong></p>
      <form data-form="body-weight" class="form-grid">
        <div class="field">
          <label>Peso actual (kg)</label>
          <input name="weight" type="number" min="0" step="0.1" required inputmode="decimal" placeholder="72" />
        </div>
        <div class="field">
          <label>Fecha</label>
          <input name="date" type="date" required value="${todayISO()}" />
        </div>
        <button class="btn btn-primary full" type="submit">Guardar peso</button>
      </form>
    </section>
    <section class="card form-card">
      <h2>Objetivo personal</h2>
      <form data-form="goal" class="form-card">
        <div class="field">
          <label>Tu objetivo</label>
          <textarea name="goal" placeholder="Ganar masa muscular, perder grasa, mejorar fuerza...">${escapeHTML(state.data.goal)}</textarea>
        </div>
        <button class="btn btn-primary" type="submit">Guardar objetivo</button>
      </form>
    </section>
    ${renderBodyWeightChartSection()}
    <section class="card form-card">
      <h2>Zona de seguridad</h2>
      <p>Borra todos los días, ejercicios, entrenamientos, series, peso corporal y objetivo guardados en este navegador.</p>
      <button class="btn btn-danger" type="button" data-action="wipe-data">Borrar todos los datos</button>
    </section>
  `;
}

function renderBodyWeightChartSection() {
  const points = state.data.bodyWeightHistory
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((item) => ({ label: shortDate(item.date), value: Number(item.weight), note: "peso corporal" }));
  return renderChartCarousel("body-weight", "Evolución del peso corporal", points, {
    unit: "kg",
    emptyText: "Todavía no has registrado tu peso corporal.",
    singleNote: "Registra más pesos para ver tu evolución.",
  });
}

function renderEmpty(icon, title, text) {
  return `<section class="empty-state"><div><div class="empty-icon" aria-hidden="true">${icon}</div><h2>${escapeHTML(title)}</h2><p>${escapeHTML(text)}</p></div></section>`;
}

function renderInlineEmpty(text) {
  return `<div class="exercise-card"><p>${escapeHTML(text)}</p></div>`;
}

function handleSubmit(event) {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const type = form.dataset.form;
  if (type === "day") return saveDay(data);
  if (type === "exercise") return saveExercise(form.dataset.dayId, data);
  if (type === "set") return saveSet(form.dataset.exerciseId, data);
  if (type === "edit-set") return saveEditedSet(form.dataset.exerciseId, form.dataset.setIndex, data);
  if (type === "body-weight") return saveBodyWeight(data);
  if (type === "goal") return saveGoal(data);
}

function saveDay(formData) {
  const name = formData.name.trim();
  const dayNumber = Number(formData.dayNumber);
  if (!name || !dayNumber) return showToast("Completa el número y el nombre del día.");
  const repeated = state.data.routineDays.some((day) => Number(day.dayNumber) === dayNumber && day.id !== formData.id);
  if (repeated) return showToast("Ya existe un día con ese número.");
  if (formData.id) {
    const day = state.data.routineDays.find((item) => item.id === formData.id);
    Object.assign(day, { name, dayNumber });
    state.editingDayId = null;
    state.routineView = { screen: "detail", dayId: day.id, addMode: null };
  } else {
    const newDay = { id: createId("day"), dayNumber, name, exercises: [] };
    state.data.routineDays.push(newDay);
    state.routineView = { screen: "detail", dayId: newDay.id, addMode: null };
  }
  saveData("Día guardado correctamente.");
}

function saveExercise(dayId, formData) {
  const day = state.data.routineDays.find((item) => item.id === dayId);
  const name = formData.name.trim();
  if (!day || !name) return showToast("El ejercicio necesita un nombre.");
  const payload = {
    id: formData.id || createId("exercise"),
    name,
    muscleGroup: formData.muscleGroup.trim(),
    description: formData.description.trim(),
    instructions: formData.instructions.trim(),
    plannedSets: formData.plannedSets ? Number(formData.plannedSets) : "",
    targetReps: formData.targetReps.trim(),
  };
  if (formData.id) {
    const index = day.exercises.findIndex((exercise) => exercise.id === formData.id);
    day.exercises[index] = payload;
    state.editingExercise = null;
  } else {
    day.exercises.push(payload);
    clearExerciseDraft(dayId);
    if (state.catalogPicker?.dayId === dayId) state.catalogPicker = null;
  }
  state.routineView = { screen: "detail", dayId, addMode: null };
  saveData("Ejercicio guardado.");
}

function saveSet(exerciseId, formData) {
  const exercise = state.activeWorkout?.exercises.find((item) => item.exerciseId === exerciseId);
  const weight = Number(formData.weight);
  const reps = Number(formData.reps);
  if (!exercise || Number.isNaN(weight) || Number.isNaN(reps) || reps <= 0) return showToast("Añade peso y repeticiones válidas.");
  exercise.sets.push({ setNumber: exercise.sets.length + 1, weight, reps });
  showToast("Serie guardada.");
  render();
}

function saveEditedSet(exerciseId, setIndex, formData) {
  const exercise = state.activeWorkout?.exercises.find((item) => item.exerciseId === exerciseId);
  const index = Number(setIndex);
  const weight = Number(formData.weight);
  const reps = Number(formData.reps);
  if (!exercise || !exercise.sets[index] || Number.isNaN(weight) || Number.isNaN(reps) || reps <= 0) return showToast("Añade peso y repeticiones válidas.");
  exercise.sets[index] = { ...exercise.sets[index], weight, reps };
  renumberSets(exercise);
  state.editingSet = null;
  showToast("Serie actualizada.");
  renderPreservingScroll();
}

function renumberSets(exercise) {
  exercise.sets = exercise.sets.map((set, index) => ({ ...set, setNumber: index + 1 }));
}

async function deleteWorkoutSet(exerciseId, setIndex) {
  const scrollY = window.scrollY;
  const exercise = state.activeWorkout?.exercises.find((item) => item.exerciseId === exerciseId);
  const index = Number(setIndex);
  if (!exercise || !exercise.sets[index]) return showToast("No se encontró la serie.");
  const ok = await confirmAction("Eliminar serie", `Se eliminará la Serie ${exercise.sets[index].setNumber}. Las series restantes se renumerarán.`);
  if (!ok) return;
  exercise.sets.splice(index, 1);
  renumberSets(exercise);
  state.editingSet = null;
  showToast("Serie eliminada.");
  renderPreservingScroll(scrollY);
}

function saveBodyWeight(formData) {
  const weight = Number(formData.weight);
  if (Number.isNaN(weight) || weight <= 0 || !formData.date) return showToast("Añade un peso y fecha válidos.");
  state.data.bodyWeightHistory.push({ date: formData.date, weight });
  state.data.bodyWeightHistory.sort((a, b) => a.date.localeCompare(b.date));
  saveData("Peso corporal guardado.");
}

function saveGoal(formData) {
  state.data.goal = formData.goal.trim();
  saveData("Objetivo actualizado.");
}

async function confirmAction(title, message) {
  if (!dialog.showModal) return window.confirm(message);
  confirmTitle.textContent = title;
  confirmMessage.textContent = message;
  dialog.showModal();
  return new Promise((resolve) => {
    dialog.addEventListener("close", () => resolve(dialog.returnValue === "confirm"), { once: true });
  });
}

async function handleClick(event) {
  const target = event.target.closest("button, [data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (!action) return;

  if (action === "go-routine") return navigate("routine");
  if (action === "start-from-home") {
    const suggested = getSuggestedRoutineDay();
    state.selectedTrainingDayId = suggested?.id || sortedRoutineDays()[0]?.id || null;
    return navigate("train");
  }
  if (action === "create-day-screen") { state.editingDayId = null; return setRoutineView("create"); }
  if (action === "back-to-routine") { state.editingDayId = null; state.editingExercise = null; return setRoutineView("list"); }
  if (action === "open-routine-day") return setRoutineView("detail", { dayId: target.dataset.dayId });
  if (action === "back-to-day") { state.editingExercise = null; state.catalogPicker = null; clearExerciseDraft(target.dataset.dayId); return setRoutineView("detail", { dayId: target.dataset.dayId }); }
  if (action === "add-exercise-screen") { state.editingExercise = null; return setRoutineView("add", { dayId: target.dataset.dayId }); }
  if (action === "manual-exercise-screen") return setRoutineView("add", { dayId: target.dataset.dayId, addMode: "manual" });
  if (action === "open-catalog-screen") {
    state.catalogPicker = { dayId: target.dataset.dayId, step: "group", group: null, subgroup: null };
    return setRoutineView("catalog", { dayId: target.dataset.dayId });
  }
  if (action === "edit-day") { state.editingDayId = target.dataset.dayId; return setRoutineView("detail", { dayId: target.dataset.dayId }); }
  if (action === "cancel-edit-day") { state.editingDayId = null; return target.dataset.dayId ? setRoutineView("detail", { dayId: target.dataset.dayId }) : setRoutineView("list"); }
  if (action === "edit-exercise") {
    state.editingExercise = { dayId: target.dataset.dayId, exerciseId: target.dataset.exerciseId };
    state.catalogPicker = null;
    return setRoutineView("add", { dayId: target.dataset.dayId, addMode: "manual" });
  }
  if (action === "cancel-edit-exercise") { state.editingExercise = null; return setRoutineView("detail", { dayId: target.dataset.dayId }); }
  if (action === "catalog-select-group") { state.catalogPicker = { dayId: target.dataset.dayId, step: "subgroup", group: target.dataset.group, subgroup: null }; return setRoutineView("catalog", { dayId: target.dataset.dayId }); }
  if (action === "catalog-select-subgroup") { state.catalogPicker = { ...state.catalogPicker, step: "exercise", subgroup: target.dataset.subgroup }; return setRoutineView("catalog", { dayId: target.dataset.dayId }); }
  if (action === "catalog-select-exercise") return selectCatalogExercise(target.dataset.dayId, target.dataset.exerciseName);
  if (action === "catalog-back") return goBackInCatalog(target.dataset.dayId);
  if (action === "delete-day") return deleteDay(target.dataset.dayId);
  if (action === "delete-exercise") return deleteExercise(target.dataset.dayId, target.dataset.exerciseId);
  if (action === "progress-open-group") return setProgressView("group", { group: target.dataset.group });
  if (action === "progress-back-groups") return setProgressView("groups");
  if (action === "progress-open-exercise") return setProgressView("exercise", { group: target.dataset.group, exerciseKey: target.dataset.exerciseKey });
  if (action === "progress-back-group") return setProgressView("group", { group: target.dataset.group });
  if (action === "select-train-day") { state.selectedTrainingDayId = target.dataset.dayId; return render(); }
  if (action === "begin-workout") return beginWorkout(target.dataset.dayId);
  if (action === "open-exercise-logger") { state.activeExerciseId = target.dataset.exerciseId; return render(); }
  if (action === "back-to-workout") { state.activeExerciseId = null; state.editingSet = null; return render(); }
  if (action === "add-another-set") return document.querySelector("[name='weight']")?.focus();
  if (action === "edit-set") { state.editingSet = { exerciseId: target.dataset.exerciseId, setIndex: Number(target.dataset.setIndex) }; return renderPreservingScroll(); }
  if (action === "cancel-edit-set") { state.editingSet = null; return renderPreservingScroll(); }
  if (action === "delete-set") return deleteWorkoutSet(target.dataset.exerciseId, target.dataset.setIndex);
  if (action === "finish-workout") return finishWorkout();
  if (action === "cancel-workout") return cancelWorkout();
  if (action === "chart-prev") return setChartSlide(target.dataset.chartId, (state.chartSlides[target.dataset.chartId] || 0) - 1);
  if (action === "chart-next") return setChartSlide(target.dataset.chartId, (state.chartSlides[target.dataset.chartId] || 0) + 1);
  if (action === "chart-go") return setChartSlide(target.dataset.chartId, Number(target.dataset.chartIndex));
  if (action === "wipe-data") return wipeData();
}

function selectCatalogExercise(dayId, exerciseName) {
  const picker = state.catalogPicker;
  if (!picker || picker.dayId !== dayId || !picker.group || !picker.subgroup) return showToast("Vuelve a escoger grupo y zona.");
  setExerciseDraft(dayId, buildCatalogExercise(picker.group, picker.subgroup, exerciseName));
  state.catalogPicker = null;
  state.routineView = { screen: "add", dayId, addMode: "manual" };
  showToast("Ejercicio cargado. Revísalo y guarda.");
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goBackInCatalog(dayId) {
  const picker = state.catalogPicker;
  if (!picker || picker.dayId !== dayId) return;
  if (picker.step === "exercise") state.catalogPicker = { dayId, step: "subgroup", group: picker.group, subgroup: null };
  else if (picker.step === "subgroup") state.catalogPicker = { dayId, step: "group", group: null, subgroup: null };
  else state.catalogPicker = null;
  setRoutineView(state.catalogPicker ? "catalog" : "add", { dayId });
}

async function deleteDay(dayId) {
  const ok = await confirmAction("Eliminar día", "Se eliminará el día y todos sus ejercicios. Los entrenamientos históricos se conservarán.");
  if (!ok) return;
  state.data.routineDays = state.data.routineDays.filter((day) => day.id !== dayId);
  state.editingDayId = null;
  state.editingExercise = null;
  state.routineView = { screen: "list", dayId: null, addMode: null };
  saveData("Día eliminado.");
}

async function deleteExercise(dayId, exerciseId) {
  const ok = await confirmAction("Eliminar ejercicio", "Se eliminará este ejercicio de la rutina. El historial ya registrado se conservará.");
  if (!ok) return;
  const day = state.data.routineDays.find((item) => item.id === dayId);
  if (!day) return showToast("No se encontró el día del ejercicio.");
  day.exercises = day.exercises.filter((exercise) => exercise.id !== exerciseId);
  state.routineView = { screen: "detail", dayId, addMode: null };
  saveData("Ejercicio eliminado.");
}

async function finishWorkout() {
  const hasSets = state.activeWorkout.exercises.some((exercise) => exercise.sets.length > 0);
  if (!hasSets) return showToast("Registra al menos una serie antes de finalizar.");
  state.data.workouts.push(state.activeWorkout);
  state.activeWorkout = null;
  state.activeExerciseId = null;
  state.editingSet = null;
  saveData("Entrenamiento finalizado y guardado.");
}

async function cancelWorkout() {
  const ok = await confirmAction("Cancelar entrenamiento", "Se perderán las series de este entrenamiento activo.");
  if (!ok) return;
  state.activeWorkout = null;
  state.activeExerciseId = null;
  state.editingSet = null;
  render();
}

async function wipeData() {
  const ok = await confirmAction("Borrar todos los datos", "Esta acción limpiará localStorage y reiniciará la app en este navegador.");
  if (!ok) return;
  localStorage.removeItem(STORAGE_KEY);
  state.data = structuredClone(DEFAULT_DATA);
  state.section = "home";
  state.activeWorkout = null;
  state.activeExerciseId = null;
  state.editingSet = null;
  state.editingDayId = null;
  state.editingExercise = null;
  state.routineView = { screen: "list", dayId: null, addMode: null };
  state.progressView = { screen: "groups", group: null, exerciseKey: null };
  state.chartSlides = {};
  state.catalogPicker = null;
  state.exerciseDrafts = {};
  showToast("Datos borrados.");
  navigate("home");
}

function handleChange() {
  // Reserved for future form controls that need live updates.
}

function handleChartTouchStart(event) {
  const carousel = event.target.closest(".chart-carousel");
  if (!carousel) return;
  carousel.dataset.touchStartX = String(event.touches[0].clientX);
}

function handleChartTouchEnd(event) {
  const carousel = event.target.closest(".chart-carousel");
  if (!carousel || !carousel.dataset.touchStartX) return;
  const startX = Number(carousel.dataset.touchStartX);
  const endX = event.changedTouches[0].clientX;
  const deltaX = endX - startX;
  delete carousel.dataset.touchStartX;
  if (Math.abs(deltaX) < 45) return;
  const current = state.chartSlides[carousel.dataset.chartId] || 0;
  setChartSlide(carousel.dataset.chartId, deltaX < 0 ? current + 1 : current - 1);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.section));
});
app.addEventListener("submit", handleSubmit);
app.addEventListener("click", handleClick);
app.addEventListener("change", handleChange);
app.addEventListener("touchstart", handleChartTouchStart, { passive: true });
app.addEventListener("touchend", handleChartTouchEnd, { passive: true });

render();
