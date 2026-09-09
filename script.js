
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