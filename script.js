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
  const isAbs = group === "Abdomen";
  const defaultReps = isAbs ? (subgroup === "Core" || exerciseName.toLowerCase().includes("plancha") ? "30-60 seg" : "12-20") : "8-12";
  return {
    name: exerciseName,
    muscleGroup: group,
    description: custom.description || `Ejercicio recomendado para trabajar ${subgroup.toLowerCase()} dentro de ${group.toLowerCase()}.`,
    instructions: custom.instructions || `Realiza ${exerciseName.toLowerCase()} con técnica controlada, rango de movimiento cómodo y sin perder estabilidad durante la serie.`,
    plannedSets: custom.plannedSets || (isAbs ? 3 : 4),
    targetReps: custom.targetReps || defaultReps,
  };
}

function renderRoutine() {
  const nextNumber = getNextDayNumber();
  const editDay = state.data.routineDays.find((day) => day.id === state.editingDayId);
  return `
    <section class="card form-card">
      <div>
        <span class="chip">Rutina personalizada</span>
        <h2>${editDay ? "Editar día" : "Crear día de entrenamiento"}</h2>
        <p>Crea tus propios días y añade ejercicios. La app empieza vacía, sin ejercicios predeterminados.</p>
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
    ${sortedRoutineDays().length ? sortedRoutineDays().map(renderDayCard).join("") : renderEmpty("📋", "Sin días creados", "Crea tu primer día para empezar a construir tu rutina.")}
  `;
}

function getNextDayNumber() {
  const numbers = state.data.routineDays.map((day) => Number(day.dayNumber));
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

function renderDayCard(day) {
  return `
    <details class="day-card" open>
      <summary>
        <div>
          <p class="tiny">Día ${escapeHTML(day.dayNumber)}</p>
          <h2 class="day-title">${escapeHTML(day.name)}</h2>
          <p class="tiny">${day.exercises.length} ejercicios</p>
        </div>
        <span class="pill accent">Abrir</span>
      </summary>
      <div class="day-content">
        <div class="action-row">
          <button class="btn btn-secondary btn-small" type="button" data-action="edit-day" data-day-id="${day.id}">Editar día</button>
          <button class="btn btn-danger btn-small" type="button" data-action="delete-day" data-day-id="${day.id}">Eliminar día</button>
        </div>
        ${day.exercises.length ? day.exercises.map((exercise) => renderExerciseCard(day, exercise)).join("") : renderInlineEmpty("Aún no hay ejercicios en este día.")}
        ${renderExerciseForm(day)}
      </div>
    </details>
  `;
}

function renderExerciseCard(day, exercise) {
  return `
    <article class="exercise-card">
      <h3>${escapeHTML(exercise.name)}</h3>
      <p>${escapeHTML(exercise.description || "Sin descripción breve.")}</p>
      <div class="exercise-meta">
        <span class="pill accent">${escapeHTML(exercise.muscleGroup || "Sin grupo")}</span>
        <span class="pill">${escapeHTML(exercise.plannedSets || "—")} series</span>
        <span class="pill">${escapeHTML(exercise.targetReps || "—")} reps</span>
      </div>
      <details>
        <summary class="tiny">Ver instrucciones</summary>
        <p>${escapeHTML(exercise.instructions || "Añade instrucciones para convertir tu rutina en una guía personal.")}</p>
      </details>
      <div class="action-row">
        <button class="btn btn-ghost btn-small" type="button" data-action="edit-exercise" data-day-id="${day.id}" data-exercise-id="${exercise.id}">Editar</button>
        <button class="btn btn-danger btn-small" type="button" data-action="delete-exercise" data-day-id="${day.id}" data-exercise-id="${exercise.id}">Eliminar</button>
      </div>
    </article>
  `;
}

function renderCatalogPicker(day) {
  const picker = state.catalogPicker?.dayId === day.id ? state.catalogPicker : null;
  if (!picker || picker.step === "closed") return "";

  const steps = { group: "Paso 1 de 3 · Grupo muscular", subgroup: "Paso 2 de 3 · Zona", exercise: "Paso 3 de 3 · Ejercicio" };
  const backButton = picker.step !== "group"
    ? `<button class="btn btn-ghost" type="button" data-action="catalog-back" data-day-id="${day.id}">← Volver</button>`
    : `<button class="btn btn-ghost" type="button" data-action="catalog-close" data-day-id="${day.id}">Cerrar catálogo</button>`;

  let cards = "";
  if (picker.step === "group") {
    cards = getCatalogGroups().map((group) => `
      <button class="catalog-card ${picker.group === group ? "selected" : ""}" type="button" data-action="catalog-select-group" data-day-id="${day.id}" data-group="${escapeHTML(group)}">
        <strong>${escapeHTML(group)}</strong>
        <span>${getCatalogSubgroups(group).length} zonas disponibles</span>
      </button>
    `).join("");
  }

  if (picker.step === "subgroup") {
    cards = getCatalogSubgroups(picker.group).map((subgroup) => `
      <button class="catalog-card ${picker.subgroup === subgroup ? "selected" : ""}" type="button" data-action="catalog-select-subgroup" data-day-id="${day.id}" data-subgroup="${escapeHTML(subgroup)}">
        <strong>${escapeHTML(subgroup)}</strong>
        <span>${getCatalogExercises(picker.group, subgroup).length} ejercicios recomendados</span>
      </button>
    `).join("");
  }

  if (picker.step === "exercise") {
    cards = getCatalogExercises(picker.group, picker.subgroup).map((exerciseName) => `
      <button class="catalog-card" type="button" data-action="catalog-select-exercise" data-day-id="${day.id}" data-exercise-name="${escapeHTML(exerciseName)}">
        <strong>${escapeHTML(exerciseName)}</strong>
        <span>Rellenar formulario y revisar</span>
      </button>
    `).join("");
  }

  return `
    <div class="catalog-panel">
      <div>
        <span class="chip">${steps[picker.step]}</span>
        <h3>${picker.step === "group" ? "Escoge un ejercicio" : picker.step === "subgroup" ? "Elige la zona" : "Elige el ejercicio"}</h3>
        <p>${escapeHTML([picker.group, picker.subgroup].filter(Boolean).join(" · ") || "Selecciona una tarjeta grande para avanzar.")}</p>
      </div>
      <div class="catalog-grid">${cards}</div>
      ${backButton}
    </div>
  `;
}

function renderExerciseForm(day) {
  const editing = state.editingExercise?.dayId === day.id ? day.exercises.find((exercise) => exercise.id === state.editingExercise.exerciseId) : null;
  const draft = !editing ? getExerciseDraft(day.id) : null;
  const values = editing || draft || {};
  const catalogOpen = state.catalogPicker?.dayId === day.id && state.catalogPicker.step !== "closed";
  return `
    <section class="card form-card">
      <div>
        <h3>${editing ? "Editar ejercicio" : "Añadir ejercicio"}</h3>
        <p class="tiny">Elige si quieres escribirlo a mano o rellenarlo automáticamente desde el catálogo.</p>
      </div>
      ${!editing ? `
        <div class="mode-switch" aria-label="Modo para añadir ejercicio">
          <button class="mode-option ${catalogOpen ? "" : "active"}" type="button" data-action="catalog-close" data-day-id="${day.id}">Añadir manualmente</button>
          <button class="mode-option ${catalogOpen ? "active" : ""}" type="button" data-action="catalog-open" data-day-id="${day.id}">Escoger desde catálogo</button>
        </div>
        ${renderCatalogPicker(day)}
      ` : ""}
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
        <button class="btn btn-primary full" type="submit">${editing ? "Guardar ejercicio" : "Añadir ejercicio"}</button>
        ${editing ? `<button class="btn btn-ghost full" type="button" data-action="cancel-edit-exercise">Cancelar edición</button>` : ""}
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
        ${exercise.sets.length ? exercise.sets.map((set) => `<div class="set-row"><strong>Serie ${set.setNumber}</strong><span>${set.weight} kg · ${set.reps} reps</span></div>`).join("") : renderInlineEmpty("Por defecto empiezas en Serie 1. Guarda la primera serie para verla aquí.")}
      </section>
      <button class="btn btn-secondary" type="button" data-action="add-another-set">Añadir otra serie</button>
    </section>
  `;
}

function renderProgress() {
  const exercises = getAllExercises();
  const selectedId = document.querySelector("[name='progressExercise']")?.value || exercises[0]?.id || "";
  const selected = exercises.find((exercise) => exercise.id === selectedId) || exercises[0];
  const progress = selected ? getExerciseProgress(selected.id) : null;
  return `
    <section class="card form-card">
      <span class="chip">Progreso</span>
      <h2>Analiza un ejercicio</h2>
      ${exercises.length ? `
        <div class="field">
          <label>Seleccionar ejercicio</label>
          <select name="progressExercise" data-action="select-progress-exercise">
            ${exercises.map((exercise) => `<option value="${exercise.id}" ${exercise.id === selected?.id ? "selected" : ""}>${escapeHTML(exercise.name)} · Día ${escapeHTML(exercise.dayNumber)}</option>`).join("")}
          </select>
        </div>
      ` : ""}
    </section>
    ${selected && progress ? renderProgressDetail(selected, progress) : renderEmpty("📈", "Sin ejercicios", "Añade ejercicios en Rutina y registra entrenamientos para ver estadísticas.")}
  `;
}

function getAllExercises() {
  return sortedRoutineDays().flatMap((day) => day.exercises.map((exercise) => ({ ...exercise, dayNumber: day.dayNumber, dayName: day.name })));
}

function getExerciseProgress(exerciseId) {
  const entries = state.data.workouts
    .map((workout) => {
      const exercise = workout.exercises.find((item) => item.exerciseId === exerciseId);
      if (!exercise || !exercise.sets.length) return null;
      const weights = exercise.sets.map((set) => Number(set.weight));
      const reps = exercise.sets.map((set) => Number(set.reps));
      return {
        date: workout.date,
        dayName: workout.dayName,
        maxWeight: Math.max(...weights),
        maxReps: Math.max(...reps),
        setCount: exercise.sets.length,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (!entries.length) return { entries: [] };
  const last = entries.at(-1);
  const previous = entries.at(-2);
  const bestWeight = Math.max(...entries.map((entry) => entry.maxWeight));
  const bestReps = Math.max(...entries.map((entry) => entry.maxReps));
  const evolution = previous ? last.maxWeight - previous.maxWeight : null;
  return { entries, last, previous, bestWeight, bestReps, evolution };
}

function renderProgressDetail(exercise, progress) {
  if (!progress.entries.length) {
    return renderEmpty("📈", exercise.name, "Todavía no hay entrenamientos registrados para este ejercicio.");
  }
  const evolutionLabel = progress.evolution === null ? "Sin datos previos" : progress.evolution === 0 ? "Sin cambios" : `${progress.evolution > 0 ? "+" : ""}${progress.evolution} kg`;
  return `
    <section class="stats-grid">
      ${statCard("Último peso", `${progress.last.maxWeight} kg`, formatDate(progress.last.date))}
      ${statCard("Mejor peso", `${progress.bestWeight} kg`, exercise.name)}
      ${statCard("Mejores reps", progress.bestReps, "en una serie")}
      ${statCard("Veces entrenado", progress.entries.length, "sesiones registradas")}
      ${statCard("Evolución", evolutionLabel, "vs. entrenamiento anterior")}
      ${statCard("Último día", progress.last.dayName, formatDate(progress.last.date))}
    </section>
    <section class="card grid">
      <h2>Historial</h2>
      ${progress.entries.slice().reverse().map((entry) => `
        <article class="history-item">
          <h3>${formatDate(entry.date)}</h3>
          <p>${escapeHTML(entry.dayName)}</p>
          <div class="exercise-meta">
            <span class="pill accent">${entry.maxWeight} kg máx.</span>
            <span class="pill">${entry.maxReps} reps máx.</span>
            <span class="pill">${entry.setCount} series</span>
          </div>
        </article>
      `).join("")}
    </section>
  `;
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
    <section class="card grid">
      <h2>Historial de peso</h2>
      ${state.data.bodyWeightHistory.length ? state.data.bodyWeightHistory.slice().reverse().map((item) => `<div class="set-row"><strong>${formatDate(item.date)}</strong><span>${item.weight} kg</span></div>`).join("") : renderInlineEmpty("Aún no has registrado peso corporal.")}
    </section>
    <section class="card form-card">
      <h2>Zona de seguridad</h2>
      <p>Borra todos los días, ejercicios, entrenamientos, series, peso corporal y objetivo guardados en este navegador.</p>
      <button class="btn btn-danger" type="button" data-action="wipe-data">Borrar todos los datos</button>
    </section>
  `;
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
  } else {
    state.data.routineDays.push({ id: createId("day"), dayNumber, name, exercises: [] });
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
  if (action === "edit-day") { state.editingDayId = target.dataset.dayId; return render(); }
  if (action === "cancel-edit-day") { state.editingDayId = null; return render(); }
  if (action === "edit-exercise") { state.editingExercise = { dayId: target.dataset.dayId, exerciseId: target.dataset.exerciseId }; state.catalogPicker = null; return render(); }
  if (action === "cancel-edit-exercise") { state.editingExercise = null; return render(); }
  if (action === "catalog-open") { state.catalogPicker = { dayId: target.dataset.dayId, step: "group", group: null, subgroup: null }; return render(); }
  if (action === "catalog-close") { state.catalogPicker = null; clearExerciseDraft(target.dataset.dayId); return render(); }
  if (action === "catalog-select-group") { state.catalogPicker = { dayId: target.dataset.dayId, step: "subgroup", group: target.dataset.group, subgroup: null }; return render(); }
  if (action === "catalog-select-subgroup") { state.catalogPicker = { ...state.catalogPicker, step: "exercise", subgroup: target.dataset.subgroup }; return render(); }
  if (action === "catalog-select-exercise") return selectCatalogExercise(target.dataset.dayId, target.dataset.exerciseName);
  if (action === "catalog-back") return goBackInCatalog(target.dataset.dayId);
  if (action === "delete-day") return deleteDay(target.dataset.dayId);
  if (action === "delete-exercise") return deleteExercise(target.dataset.dayId, target.dataset.exerciseId);
  if (action === "select-train-day") { state.selectedTrainingDayId = target.dataset.dayId; return render(); }
  if (action === "begin-workout") return beginWorkout(target.dataset.dayId);
  if (action === "open-exercise-logger") { state.activeExerciseId = target.dataset.exerciseId; return render(); }
  if (action === "back-to-workout") { state.activeExerciseId = null; return render(); }
  if (action === "add-another-set") return document.querySelector("[name='weight']")?.focus();
  if (action === "finish-workout") return finishWorkout();
  if (action === "cancel-workout") return cancelWorkout();
  if (action === "wipe-data") return wipeData();
}

function selectCatalogExercise(dayId, exerciseName) {
  const picker = state.catalogPicker;
  if (!picker || picker.dayId !== dayId || !picker.group || !picker.subgroup) return showToast("Vuelve a escoger grupo y zona.");
  setExerciseDraft(dayId, buildCatalogExercise(picker.group, picker.subgroup, exerciseName));
  state.catalogPicker = null;
  showToast("Ejercicio cargado. Revísalo y guarda.");
  render();
}

function goBackInCatalog(dayId) {
  const picker = state.catalogPicker;
  if (!picker || picker.dayId !== dayId) return;
  if (picker.step === "exercise") state.catalogPicker = { dayId, step: "subgroup", group: picker.group, subgroup: null };
  else if (picker.step === "subgroup") state.catalogPicker = { dayId, step: "group", group: null, subgroup: null };
  else state.catalogPicker = null;
  render();
}

async function deleteDay(dayId) {
  const ok = await confirmAction("Eliminar día", "Se eliminará el día y todos sus ejercicios. Los entrenamientos históricos se conservarán.");
  if (!ok) return;
  state.data.routineDays = state.data.routineDays.filter((day) => day.id !== dayId);
  saveData("Día eliminado.");
}

async function deleteExercise(dayId, exerciseId) {
  const ok = await confirmAction("Eliminar ejercicio", "Se eliminará este ejercicio de la rutina. El historial ya registrado se conservará.");
  if (!ok) return;
  const day = state.data.routineDays.find((item) => item.id === dayId);
  day.exercises = day.exercises.filter((exercise) => exercise.id !== exerciseId);
  saveData("Ejercicio eliminado.");
}

async function finishWorkout() {
  const hasSets = state.activeWorkout.exercises.some((exercise) => exercise.sets.length > 0);
  if (!hasSets) return showToast("Registra al menos una serie antes de finalizar.");
  state.data.workouts.push(state.activeWorkout);
  state.activeWorkout = null;
  state.activeExerciseId = null;
  saveData("Entrenamiento finalizado y guardado.");
}

async function cancelWorkout() {
  const ok = await confirmAction("Cancelar entrenamiento", "Se perderán las series de este entrenamiento activo.");
  if (!ok) return;
  state.activeWorkout = null;
  state.activeExerciseId = null;
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
  state.editingDayId = null;
  state.editingExercise = null;
  state.catalogPicker = null;
  state.exerciseDrafts = {};
  showToast("Datos borrados.");
  navigate("home");
}

function handleChange(event) {
  if (event.target.matches("[data-action='select-progress-exercise']")) renderProgressSelection(event.target.value);
}

function renderProgressSelection(exerciseId) {
  const exercises = getAllExercises();
  const selected = exercises.find((exercise) => exercise.id === exerciseId);
  const progress = selected ? getExerciseProgress(selected.id) : null;
  const topCard = app.querySelector(".card.form-card");
  app.innerHTML = topCard.outerHTML + (selected && progress ? renderProgressDetail(selected, progress) : "");
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.section));
});
app.addEventListener("submit", handleSubmit);
app.addEventListener("click", handleClick);
app.addEventListener("change", handleChange);

render();
