/*
       * ================================================
       * PAGE NAVIGATION
       * ================================================
       */

      function navigateTo(page) {
        const validPages = [
          "dashboard",
          "routine",
          "workout",
          "history",
          "progress",
          "settings",
        ];

        if (!validPages.includes(page)) {
          page = "dashboard";
        }

        // Hide every page

        document.querySelectorAll(".page").forEach((section) => {
          section.classList.remove("active");
        });

        // Show selected page

        const selectedPage = document.getElementById(`page-${page}`);

        if (selectedPage) {
          selectedPage.classList.add("active");
        }

        // Update desktop navigation

        document.querySelectorAll(".nav-item").forEach((item) => {
          item.classList.remove("active");
        });

        const desktopItem = document.querySelector(
          `.nav-item[data-page="${page}"]`,
        );

        if (desktopItem) {
          desktopItem.classList.add("active");
        }

        // Update mobile bottom navigation

        document.querySelectorAll(".mobile-nav-item").forEach((item) => {
          item.classList.remove("active");
        });

        const mobileItem = document.querySelector(
          `.mobile-nav-item[data-mobile-page="${page}"]`,
        );

        if (mobileItem) {
          mobileItem.classList.add("active");
        }

        // Hide mobile workout button while already on workout page

        const mobileWorkoutButton = document.getElementById(
          "mobile-workout-button",
        );

        if (mobileWorkoutButton) {
          if (page === "workout") {
            mobileWorkoutButton.classList.add("hidden");
          } else {
            mobileWorkoutButton.classList.remove("hidden");
          }
        }

        // Load the saved routine into the Start Workout page

        if (page === "workout") {
          initWorkoutPage();
        }

        // Render saved sessions whenever History is opened

        if (page === "history") {
          renderHistory();
        }

        // Close mobile drawer

        closeMobileMenu();

        // Update browser URL

        const currentHash = window.location.hash.replace("#", "");

        if (currentHash !== page) {
          history.pushState({ page: page }, "", `#${page}`);
        }

        // Scroll to top

        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        // Re-render Lucide icons

        lucide.createIcons();
      }

      /*
       * ================================================
       * MOBILE MENU
       * ================================================
       */

      function openMobileMenu() {
        const drawer = document.getElementById("mobile-drawer");

        const overlay = document.getElementById("mobile-menu-overlay");

        if (!drawer || !overlay) {
          return;
        }

        drawer.classList.add("open");
        overlay.classList.add("open");

        document.body.classList.add("overflow-hidden");
      }

      function closeMobileMenu() {
        const drawer = document.getElementById("mobile-drawer");

        const overlay = document.getElementById("mobile-menu-overlay");

        if (!drawer || !overlay) {
          return;
        }

        drawer.classList.remove("open");
        overlay.classList.remove("open");

        document.body.classList.remove("overflow-hidden");
      }

      /*
       * ================================================
       * ESCAPE KEY
       * ================================================
       */

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMobileMenu();
          closeDayEditor();
        }
      });

      /*
       * ================================================
       * INITIALIZE ICONS
       * ================================================
       */

      lucide.createIcons();

      /*
       * ================================================
       * ROUTINE DATA (persisted to localStorage)
       * ================================================
       */

      const ROUTINE_STORAGE_KEY = "workoutTracker.routine";

      const DAY_ORDER = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      const DAY_LABELS = {
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
      };

      // Seed data - only used the very first time the app runs on a browser,
      // before anything has been saved to localStorage yet.
      const DEFAULT_ROUTINE = {
        monday: {
          label: "Push Day",
          exercises: [
            { name: "Bench Press", sets: 3 },
            { name: "Incline DB Press", sets: 3 },
            { name: "Shoulder Press", sets: 3 },
            { name: "Lateral Raises", sets: 3 },
            { name: "Tricep Pushdowns", sets: 3 },
          ],
        },
        tuesday: {
          label: "Pull Day",
          exercises: [
            { name: "Lat Pulldown", sets: 3 },
            { name: "Barbell Row", sets: 3 },
            { name: "Cable Row", sets: 3 },
            { name: "Bicep Curl", sets: 3 },
          ],
        },
        wednesday: { label: null, exercises: [] },
        thursday: {
          label: "Leg Day",
          exercises: [
            { name: "Squat", sets: 3 },
            { name: "Romanian Deadlift", sets: 3 },
            { name: "Leg Press", sets: 3 },
            { name: "Leg Curl", sets: 3 },
            { name: "Calf Raises", sets: 3 },
          ],
        },
        friday: { label: null, exercises: [] },
        saturday: {
          label: "Upper Body",
          exercises: [
            { name: "Bench Press", sets: 3 },
            { name: "Pull Ups", sets: 3 },
            { name: "Shoulder Press", sets: 3 },
            { name: "Cable Row", sets: 3 },
          ],
        },
        sunday: { label: null, exercises: [] },
      };

      let currentRoutine = null;

      function loadRoutine() {
        try {
          const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);

          if (!raw) {
            saveRoutine(DEFAULT_ROUTINE);
            return JSON.parse(JSON.stringify(DEFAULT_ROUTINE));
          }

          return JSON.parse(raw);
        } catch (err) {
          console.error("Failed to load routine, falling back to default.", err);
          return JSON.parse(JSON.stringify(DEFAULT_ROUTINE));
        }
      }

      function saveRoutine(routine) {
        localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routine));
      }

      function isRestDay(day) {
        return !day || !day.label;
      }

      function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str ?? "";
        return div.innerHTML;
      }

      /*
       * ================================================
       * ROUTINE RENDERING
       * ================================================
       */

      function renderRoutine() {
        const grid = document.getElementById("routine-grid");

        if (!grid) {
          return;
        }

        grid.innerHTML = DAY_ORDER.map((dayKey) =>
          renderDayCard(dayKey, currentRoutine[dayKey]),
        ).join("");

        lucide.createIcons();
      }

      function renderDayCard(dayKey, day) {
        const dayLabel = DAY_LABELS[dayKey];

        if (isRestDay(day)) {
          return `
            <article class="rounded-2xl border border-border bg-card p-5">
              <div class="flex items-start justify-between">
                <div>
                  <p class="text-xs font-medium uppercase tracking-wider text-zinc-500">${dayLabel}</p>
                  <h3 class="mt-2 text-xl font-semibold text-zinc-300">Rest Day</h3>
                  <p class="mt-1 text-sm text-zinc-500">No workout scheduled</p>
                </div>
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                  <i data-lucide="moon" class="h-4 w-4"></i>
                </div>
              </div>
              <div class="mt-5 rounded-xl border border-dashed border-border p-4 text-center">
                <p class="text-xs text-zinc-500">Recovery day</p>
              </div>
              <button onclick="openDayEditor('${dayKey}')" class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                <i data-lucide="plus" class="h-4 w-4"></i>
                Add Workout
              </button>
            </article>
          `;
        }

        const totalSets = day.exercises.reduce(
          (sum, ex) => sum + (Number(ex.sets) || 0),
          0,
        );

        const exerciseRows = day.exercises
          .map(
            (ex) => `
              <div class="flex items-center justify-between text-sm">
                <span class="text-zinc-300">${escapeHtml(ex.name)}</span>
                <span class="text-zinc-500">${ex.sets} sets</span>
              </div>
            `,
          )
          .join("");

        return `
          <article class="rounded-2xl border border-border bg-card p-5">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium uppercase tracking-wider text-blue-400">${dayLabel}</p>
                <h3 class="mt-2 text-xl font-semibold">${escapeHtml(day.label)}</h3>
                <p class="mt-1 text-sm text-zinc-500">${day.exercises.length} exercises • ${totalSets} sets</p>
              </div>
              <button onclick="handleDayMenu('${dayKey}')" class="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-white">
                <i data-lucide="more-horizontal" class="h-4 w-4"></i>
              </button>
            </div>
            <div class="mt-5 space-y-3 border-t border-border pt-4">
              ${exerciseRows}
            </div>
            <button onclick="openDayEditor('${dayKey}')" class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
              <i data-lucide="pencil" class="h-4 w-4"></i>
              Edit Routine
            </button>
          </article>
        `;
      }

      function handleDayMenu(dayKey) {
        const day = currentRoutine[dayKey];

        if (isRestDay(day)) {
          return;
        }

        const confirmed = confirm(
          `Clear ${DAY_LABELS[dayKey]}'s workout and mark it as a rest day?`,
        );

        if (confirmed) {
          clearDay(dayKey);
        }
      }

      function clearDay(dayKey) {
        currentRoutine[dayKey] = { label: null, exercises: [] };
        saveRoutine(currentRoutine);
        renderRoutine();
      }

      /*
       * ================================================
       * DAY EDITOR MODAL
       * ================================================
       */

      let editingDayKey = null;

      function openDayEditor(dayKey) {
        const overlay = document.getElementById("day-editor-overlay");
        const modal = document.getElementById("day-editor-modal");
        const select = document.getElementById("editor-day-select");
        const labelInput = document.getElementById("editor-day-label");

        editingDayKey = dayKey || null;

        select.innerHTML = DAY_ORDER.map(
          (key) => `<option value="${key}">${DAY_LABELS[key]}</option>`,
        ).join("");

        if (dayKey) {
          select.value = dayKey;
          select.disabled = true;
        } else {
          select.disabled = false;

          const firstRestDay = DAY_ORDER.find((key) =>
            isRestDay(currentRoutine[key]),
          );

          select.value = firstRestDay || DAY_ORDER[0];
        }

        const targetKey = dayKey || select.value;
        const day = currentRoutine[targetKey];

        labelInput.value = isRestDay(day) ? "" : day.label;

        const exerciseList = document.getElementById("editor-exercise-list");
        exerciseList.innerHTML = "";

        if (!isRestDay(day) && day.exercises.length) {
          day.exercises.forEach((ex) => addExerciseRow(ex.name, ex.sets));
        } else {
          addExerciseRow();
        }

        overlay.classList.remove("hidden");
        modal.classList.remove("hidden");

        lucide.createIcons();
      }

      function closeDayEditor() {
        document.getElementById("day-editor-overlay").classList.add("hidden");
        document.getElementById("day-editor-modal").classList.add("hidden");

        editingDayKey = null;
      }

      function addExerciseRow(name = "", sets = 3) {
        const list = document.getElementById("editor-exercise-list");
        const row = document.createElement("div");

        row.className = "exercise-row flex items-center gap-2";
        row.innerHTML = `
          <input type="text" value="${escapeHtml(name)}" placeholder="Exercise name" class="exercise-name-input flex-1 rounded-lg border border-border bg-[#101012] px-3 py-2 text-sm text-zinc-300" />
          <input type="number" min="1" value="${sets}" class="exercise-sets-input w-16 rounded-lg border border-border bg-[#101012] px-2 py-2 text-center text-sm text-zinc-300" />
          <button type="button" onclick="this.closest('.exercise-row').remove()" class="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-red-400">
            <i data-lucide="x" class="h-4 w-4"></i>
          </button>
        `;

        list.appendChild(row);
        lucide.createIcons();
      }

      function saveDayEditor() {
        const dayKey = document.getElementById("editor-day-select").value;
        const label = document.getElementById("editor-day-label").value.trim();

        const rows = document.querySelectorAll(
          "#editor-exercise-list .exercise-row",
        );

        const exercises = Array.from(rows)
          .map((row) => {
            const name = row.querySelector(".exercise-name-input").value.trim();
            const sets = parseInt(
              row.querySelector(".exercise-sets-input").value,
              10,
            );

            return { name, sets: Number.isFinite(sets) && sets > 0 ? sets : 1 };
          })
          .filter((ex) => ex.name.length > 0);

        if (!label || exercises.length === 0) {
          currentRoutine[dayKey] = { label: null, exercises: [] };
        } else {
          currentRoutine[dayKey] = { label, exercises };
        }

        saveRoutine(currentRoutine);
        renderRoutine();
        closeDayEditor();
      }

      function clearDayFromEditor() {
        if (!editingDayKey) {
          closeDayEditor();
          return;
        }

        const confirmed = confirm(
          `Mark ${DAY_LABELS[editingDayKey]} as a rest day? This clears its exercises.`,
        );

        if (confirmed) {
          clearDay(editingDayKey);
          closeDayEditor();
        }
      }

      /*
       * ================================================
       * WORKOUT SESSION (Start Workout page)
       * ================================================
       */

      let currentSession = null;
      let workoutPageInitialized = false;

      function getTodayDayKey() {
        const jsDayToKey = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];

        return jsDayToKey[new Date().getDay()];
      }

      function initWorkoutPage() {
        if (!workoutPageInitialized) {
          loadWorkoutDay(getTodayDayKey());
          workoutPageInitialized = true;
        } else {
          renderWorkoutSession();
        }
      }

      function hasSessionProgress() {
        if (!currentSession) {
          return false;
        }

        return currentSession.exercises.some((ex) =>
          ex.sets.some(
            (set) => set.weight !== "" || set.reps !== "" || set.done,
          ),
        );
      }

      function loadWorkoutDay(dayKey) {
        const day = currentRoutine[dayKey];

        if (isRestDay(day)) {
          currentSession = { dayKey, exercises: [] };
        } else {
          currentSession = {
            dayKey,
            exercises: day.exercises.map((ex) => ({
              name: ex.name,
              sets: Array.from({ length: ex.sets }, () => ({
                weight: "",
                reps: "",
                done: false,
              })),
            })),
          };
        }

        document.getElementById("workout-day-select").value = dayKey;
        renderWorkoutSession();
      }

      function handleWorkoutDayChange(dayKey) {
        if (hasSessionProgress()) {
          const confirmed = confirm(
            "Switch days? Any unsaved progress on the current session will be lost.",
          );

          if (!confirmed) {
            document.getElementById("workout-day-select").value =
              currentSession.dayKey;
            return;
          }
        }

        loadWorkoutDay(dayKey);
      }

      function resetWorkoutSession() {
        if (!currentSession) {
          return;
        }

        const confirmed = confirm(
          "Reset this session? All entered weights, reps, and completed sets will be cleared.",
        );

        if (confirmed) {
          loadWorkoutDay(currentSession.dayKey);
        }
      }

      function updateWorkoutSet(exIndex, setIndex, field, value) {
        currentSession.exercises[exIndex].sets[setIndex][field] = value;
      }

      function toggleSetDone(exIndex, setIndex) {
        const set = currentSession.exercises[exIndex].sets[setIndex];

        set.done = !set.done;
        renderWorkoutSession();
      }

      function addWorkoutSet(exIndex) {
        currentSession.exercises[exIndex].sets.push({
          weight: "",
          reps: "",
          done: false,
        });

        renderWorkoutSession();
      }

      function renderWorkoutSession() {
        const day = currentRoutine[currentSession.dayKey];
        const dayLabelText = DAY_LABELS[currentSession.dayKey];
        const titleEl = document.getElementById("workout-day-title");
        const subtitleEl = document.getElementById("workout-day-subtitle");
        const listEl = document.getElementById("workout-exercise-list");
        const finishContainer = document.getElementById(
          "finish-workout-container",
        );

        if (isRestDay(day) || currentSession.exercises.length === 0) {
          titleEl.textContent = "Rest Day";
          subtitleEl.textContent = `${dayLabelText} • No workout scheduled`;

          listEl.innerHTML = `
            <div class="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
                <i data-lucide="moon" class="h-6 w-6"></i>
              </div>
              <h3 class="text-lg font-semibold text-zinc-300">Rest Day</h3>
              <p class="mt-2 text-sm text-zinc-500">
                No workout scheduled for ${dayLabelText}. Pick another day above, or set one up in My Routine.
              </p>
            </div>
          `;

          if (finishContainer) {
            finishContainer.classList.add("hidden");
          }

          lucide.createIcons();
          return;
        }

        const totalSets = currentSession.exercises.reduce(
          (sum, ex) => sum + ex.sets.length,
          0,
        );

        titleEl.textContent = day.label;
        subtitleEl.textContent = `${dayLabelText} • ${currentSession.exercises.length} exercises • ${totalSets} sets`;

        listEl.innerHTML = currentSession.exercises
          .map((ex, exIndex) => renderExerciseCard(ex, exIndex))
          .join("");

        if (finishContainer) {
          finishContainer.classList.remove("hidden");
        }

        lucide.createIcons();
      }

      function renderExerciseCard(exercise, exIndex) {
        const rows = exercise.sets
          .map((set, setIndex) => renderSetRow(set, exIndex, setIndex))
          .join("");

        return `
          <section class="mb-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <p class="text-xs uppercase tracking-wider text-blue-400">Exercise ${exIndex + 1}</p>
                <h3 class="mt-1 text-lg font-semibold">${escapeHtml(exercise.name)}</h3>
              </div>
              <span class="text-xs text-zinc-500"> ${exercise.sets.length} sets </span>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[420px] text-left">
                <thead>
                  <tr class="border-b border-border text-xs text-zinc-500">
                    <th class="pb-3 font-medium">Set</th>
                    <th class="pb-3 font-medium">Weight</th>
                    <th class="pb-3 font-medium">Reps</th>
                    <th class="pb-3 text-right font-medium">Done</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>

            <button onclick="addWorkoutSet(${exIndex})" class="mt-4 flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-zinc-300">
              <i data-lucide="plus" class="h-4 w-4"></i>
              Add Set
            </button>
          </section>
        `;
      }

      function renderSetRow(set, exIndex, setIndex) {
        const doneColor = set.done ? "text-emerald-400" : "text-zinc-600";
        const doneIcon = set.done ? "check-circle-2" : "circle";

        return `
          <tr class="border-b border-border last:border-0">
            <td class="py-3 text-sm text-zinc-400">${setIndex + 1}</td>
            <td class="py-3">
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  value="${escapeHtml(set.weight)}"
                  placeholder="Weight"
                  oninput="updateWorkoutSet(${exIndex}, ${setIndex}, 'weight', this.value)"
                  class="w-20 rounded-lg border border-border bg-[#101012] px-3 py-2 text-sm"
                />
                <span class="text-xs text-zinc-500"> kg </span>
              </div>
            </td>
            <td class="py-3">
              <input
                type="number"
                value="${escapeHtml(set.reps)}"
                placeholder="Reps"
                oninput="updateWorkoutSet(${exIndex}, ${setIndex}, 'reps', this.value)"
                class="w-20 rounded-lg border border-border bg-[#101012] px-3 py-2 text-sm"
              />
            </td>
            <td class="py-3 text-right">
              <button onclick="toggleSetDone(${exIndex}, ${setIndex})" class="${doneColor}">
                <i data-lucide="${doneIcon}" class="h-5 w-5"></i>
              </button>
            </td>
          </tr>
        `;
      }

      /*
       * ================================================
       * HISTORY (completed workout sessions)
       * ================================================
       */

      const HISTORY_STORAGE_KEY = "workoutTracker.history";

      function loadHistory() {
        try {
          const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
          return raw ? JSON.parse(raw) : [];
        } catch (err) {
          console.error("Failed to load workout history.", err);
          return [];
        }
      }

      function saveHistory(history) {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
      }

      function formatHistoryDate(isoDate) {
        const date = new Date(`${isoDate}T00:00:00`);

        return date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      function finishWorkout() {
        // Nothing to save (e.g. a rest day was showing) - just go to History.
        if (!currentSession || currentSession.exercises.length === 0) {
          navigateTo("history");
          return;
        }

        const day = currentRoutine[currentSession.dayKey];

        const completedSession = {
          date: new Date().toISOString().slice(0, 10),
          dayKey: currentSession.dayKey,
          dayLabel: day.label,
          exercises: currentSession.exercises.map((ex) => ({
            name: ex.name,
            sets: ex.sets.map((set) => ({ ...set })),
          })),
        };

        const history = loadHistory();
        history.unshift(completedSession);
        saveHistory(history);

        // Clear the in-memory session so the next visit to Start Workout
        // loads a fresh one instead of showing what was just finished.
        currentSession = null;
        workoutPageInitialized = false;

        navigateTo("history");
      }

      function renderHistory() {
        const listEl = document.getElementById("history-list");

        if (!listEl) {
          return;
        }

        const history = loadHistory();

        if (history.length === 0) {
          listEl.innerHTML = `
            <div class="p-8 text-center">
              <p class="text-sm text-zinc-500">
                No completed workouts yet. Finish a session from Start Workout and it'll show up here.
              </p>
            </div>
          `;

          lucide.createIcons();
          return;
        }

        listEl.innerHTML = history
          .map((session) => {
            const totalSets = session.exercises.reduce(
              (sum, ex) => sum + ex.sets.length,
              0,
            );

            return `
              <div class="flex w-full items-center gap-4 rounded-xl p-4 text-left">
                <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                  <i data-lucide="dumbbell" class="h-5 w-5"></i>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-medium">${escapeHtml(session.dayLabel)}</h3>
                  <p class="mt-1 text-xs text-zinc-500">
                    ${formatHistoryDate(session.date)} • ${session.exercises.length} exercises • ${totalSets} sets
                  </p>
                </div>
              </div>
            `;
          })
          .join("");

        lucide.createIcons();
      }

      // Load the saved routine (or seed defaults) and render it immediately.
      currentRoutine = loadRoutine();
      renderRoutine();

      /*
       * ================================================
       * BROWSER HISTORY
       * ================================================
       */

      window.addEventListener("popstate", () => {
        const page = window.location.hash.replace("#", "") || "dashboard";

        navigateTo(page);
      });

      /*
       * ================================================
       * INITIAL PAGE
       * ================================================
       */

      const initialPage = window.location.hash.replace("#", "") || "dashboard";

      navigateTo(initialPage);