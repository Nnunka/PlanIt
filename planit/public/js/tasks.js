let currentGroup = null;

async function showTasks(group = null) {
  currentGroup = group;

  const taskList = document.getElementById("task-list");
  taskList.innerHTML = ""; // Czyści zawartość listy zadań

  if (!group) {
    // Wyświetl zadania na dziś tylko wtedy, gdy przeglądamy wszystkie zadania
    await showTodayTasks();
  } else {
    // Jeśli przeglądamy z wybraną grupą, ukryj sekcję z zadaniami na dziś
    document.getElementById("today-tasks").innerHTML = "";
  }

  try {
    const header = document.createElement("h3");
    header.textContent = group
      ? `Zadania z grupy: ${group}`
      : "Wszystkie zadania";
    taskList.appendChild(header);

    const url = group ? `/tasks/group/${encodeURIComponent(group)}` : "/tasks";
    const response = await fetch(url);
    const data = await response.json();
    const tasks = data.tasks;

    tasks.forEach((task) => createTaskElement(task, taskList));
  } catch (error) {
    console.error("Błąd pobierania zadań:", error);
  }
}

// Funkcja do wyświetlenia zadań na dziś
async function showTodayTasks() {
  const todayTasksContainer = document.getElementById("today-tasks");
  todayTasksContainer.innerHTML = ""; // Czyści kontener zadań na dziś

  try {
    const response = await fetch("/tasks/today");
    const data = await response.json();
    const tasks = data.tasks;

    if (tasks.length > 0) {
      const header = document.createElement("h3");
      header.textContent = "Zadania na dziś";
      todayTasksContainer.appendChild(header);

      tasks.forEach((task) => createTaskElement(task, todayTasksContainer));
    } else {
      const noTasksMessage = document.createElement("p");
      noTasksMessage.textContent = "Brak zadań na dziś :)";
      todayTasksContainer.appendChild(noTasksMessage);
    }
  } catch (error) {
    console.error("Błąd pobierania zadań na dziś:", error);
  }
}

function createTaskElement(task, container) {
  // Główny element zadania
  const taskItem = document.createElement("div");
  taskItem.classList.add("task-item", "d-flex", "flex-column");
  taskItem.style.borderBottom = "1px solid #ddd";
  taskItem.style.padding = "10px";
  taskItem.style.marginBottom = "10px";

  // Górna sekcja zadania (nazwa i checkbox)
  const taskHeader = document.createElement("div");
  taskHeader.classList.add(
    "d-flex",
    "align-items-center",
    "justify-content-between"
  );

  // Sekcja nazwy zadania, ikon i gwiazdki
  const taskNameSection = document.createElement("div");
  taskNameSection.classList.add("d-flex", "align-items-center");

  // Gwiazdka (priorytet)
  const starIcon = document.createElement("span");
  starIcon.classList.add("star-icon");
  starIcon.style.cursor = "pointer";
  starIcon.innerHTML = task.task_priority === "high" ? "&#9733;" : "&#9734;"; // Zapełniona (★) lub pusta (☆) gwiazdka
  starIcon.style.color = task.task_priority === "high" ? "gold" : "gray";
  starIcon.style.fontSize = "2rem"; // Większy rozmiar gwiazdki
  starIcon.style.marginRight = "15px";

  // Obsługa kliknięcia na gwiazdkę
  starIcon.onclick = async (event) => {
    event.stopPropagation();

    try {
      const response = await fetch(`/tasks/${task.task_id}/priority`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const result = await response.json();
        const newPriority = result.newPriority;

        // Aktualizacja wyglądu gwiazdki
        starIcon.innerHTML = newPriority === "high" ? "&#9733;" : "&#9734;";
        starIcon.style.color = newPriority === "high" ? "gold" : "gray";

        // Odśwież listę zadań w zależności od kontekstu
        if (!currentGroup) {
          await showTasks();
        } else if (currentGroup === "today") {
          await showTodayTasks();
        } else {
          await filterTasksByGroup(currentGroup);
        }
      } else {
        console.error("Błąd zmiany priorytetu zadania.");
      }
    } catch (error) {
      console.error("Błąd podczas zmiany priorytetu zadania:", error);
    }
  };

  // Nazwa zadania
  const taskNameContainer = document.createElement("div");
  taskNameContainer.classList.add(
    "d-flex",
    "align-items-center",
    "flex-grow-1"
  );

  const taskName = document.createElement("span");
  taskName.innerText = task.task_name; // Ustawienie tekstu nazwy zadania
  taskName.style.cursor = "pointer"; // Dodanie wskaźnika kursora
  taskName.style.marginRight = "10px"; // Odstęp między nazwą a ikonami

  // Przekreślenie nazwy, jeśli zadanie jest ukończone
  if (task.task_completed) {
    taskName.style.textDecoration = "line-through";
  }

  // Obsługa kliknięcia w nazwę zadania
  taskName.onclick = () => {
    const isAlreadyActive = taskItem.classList.contains("active");

    // Usunięcie klasy "active" ze wszystkich zadań
    document.querySelectorAll(".task-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Dodanie klasy "active" tylko do klikniętego zadania
    if (!isAlreadyActive) taskItem.classList.add("active");

    // Wyświetlenie szczegółów zadania w prawym sidebarze
    showTaskDetailsAndRightSidebar(task.task_id);
  };

  taskNameContainer.appendChild(taskName);

  // Kontener na ikonki (zaraz obok nazwy zadania po prawej stronie)
  const iconContainer = document.createElement("div");
  iconContainer.classList.add("d-flex", "align-items-center");

  // Ikona daty
  if (task.has_date) {
    const dateIcon = document.createElement("i");
    dateIcon.classList.add("bi", "bi-calendar-event"); // Ikona Bootstrap
    dateIcon.title = "Zadanie ma przypisaną datę";
    dateIcon.style.marginLeft = "5px"; // Odstęp między ikonami
    iconContainer.appendChild(dateIcon);
  }

  // Ikona godziny
  if (task.has_time) {
    const timeIcon = document.createElement("i");
    timeIcon.classList.add("bi", "bi-clock"); // Ikona Bootstrap
    timeIcon.title = "Zadanie ma przypisaną godzinę";
    timeIcon.style.marginLeft = "5px";
    iconContainer.appendChild(timeIcon);
  }

  // Ikona grupy
  if (task.task_group) {
    const groupIcon = document.createElement("i");
    groupIcon.classList.add("bi", "bi-folder"); // Użycie ikony folderu z Bootstrap Icons
    groupIcon.title = `Grupa: ${task.task_group}`;
    groupIcon.style.marginLeft = "5px";
    iconContainer.appendChild(groupIcon);
  }

  // Ikona plików
  if (task.has_files) {
    const fileIcon = document.createElement("i");
    fileIcon.classList.add("bi", "bi-paperclip"); // Ikona Bootstrap
    fileIcon.title = "Zadanie ma załączniki";
    iconContainer.appendChild(fileIcon);
  }

  // Dodanie elementów do sekcji
  taskNameContainer.appendChild(iconContainer); // Ikonki tuż obok nazwy zadania

  // Dodanie gwiazdki, nazwy zadania i ikon do sekcji
  taskNameSection.appendChild(starIcon); // Gwiazdka po lewej stronie
  taskNameSection.appendChild(taskNameContainer); // Nazwa zadania i ikonki

  // Checkbox ukończenia zadania
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.task_completed === 1;
  checkbox.classList.add("task-checkbox");

  // Obsługa kliknięcia w checkbox
  checkbox.onclick = async (event) => {
    event.stopPropagation();
    const task_completed = checkbox.checked ? 1 : 0;
    await updateTaskStatus(task.task_id, task_completed);

    if (task_completed) {
      taskName.style.textDecoration = "line-through";
    } else {
      taskName.style.textDecoration = "none";
    }
  };

  // Dodanie sekcji nazwy i checkboxa do nagłówka
  taskHeader.appendChild(taskNameSection);
  taskHeader.appendChild(checkbox);

  // Dodanie nagłówka do głównego elementu zadania
  taskItem.appendChild(taskHeader);

  // Pasek postępu dla podzadań
  const progressBarContainer = document.createElement("div");
  progressBarContainer.classList.add("progress", "mt-2");

  const progressBar = document.createElement("div");
  progressBar.classList.add("progress-bar");
  progressBar.setAttribute("role", "progressbar");
  progressBar.style.width = "0%"; // Inicjalna szerokość
  progressBar.style.transition = "width 0.4s ease"; // Animacja zmiany szerokości

  progressBarContainer.appendChild(progressBar);
  taskItem.appendChild(progressBarContainer);

  // Pobranie danych o postępie podzadań z serwera
  fetch(`/tasks/${task.task_id}/progress`)
    .then((response) => response.json())
    .then((data) => {
      if (data.total > 0) {
        const progressPercentage = (data.completed / data.total) * 100;
        progressBar.style.width = `${progressPercentage}%`; // Ustawienie szerokości paska
        progressBar.textContent = `${data.completed}/${data.total}`; // Wyświetlenie ilości ukończonych podzadań
      } else {
        progressBarContainer.style.display = "none"; // Ukrycie paska, jeśli brak podzadań
      }
    })
    .catch((error) => {
      console.error("Błąd pobierania postępu podzadań:", error);
    });

  // Dodanie całego elementu zadania do kontenera
  container.appendChild(taskItem);
}

// Funkcja do aktualizacji statusu zadania w bazie danych
async function updateTaskStatus(taskId, task_completed) {
  try {
    const response = await fetch(`/task/${taskId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_completed }),
    });

    if (!response.ok) {
      console.error("Błąd aktualizacji statusu zadania");
    }
  } catch (error) {
    console.error("Błąd połączenia z serwerem:", error);
  }
}

// Funkcja do obsługi kliknięcia na grupę
function filterTasksByGroup(group) {
  showTasks(group);
}

// Funkcja do aktualizacji statusu zadania w bazie danych
async function updateTaskStatus(taskId, task_completed) {
  try {
    const response = await fetch(`/task/${taskId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_completed }),
    });

    if (!response.ok) {
      console.error("Błąd aktualizacji statusu zadania");
    }
  } catch (error) {
    console.error("Błąd połączenia z serwerem:", error);
  }
}

// Funkcja do dodawania nowego zadania z opcjonalną grupą
async function addTask(event) {
  event.preventDefault();

  const taskName = document.getElementById("new-task-name").value;

  try {
    const response = await fetch("/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_name: taskName, task_group: currentGroup }),
    });

    if (response.ok) {
      console.log("Zadanie zostało dodane.");
      document.getElementById("new-task-name").value = "";
      showTasks(currentGroup); // Odświeża listę zadań dla aktualnej grupy
    } else {
      console.error("Błąd dodawania zadania.");
    }
  } catch (error) {
    console.error("Błąd dodawania zadania:", error);
  }
}

//edycja zadania (sidebar)
function editTask() {
  const isEditing = !document.getElementById("task-name").disabled;

  document.getElementById("task-name").disabled = isEditing;
  document.getElementById("task-more").disabled = isEditing;
  document.getElementById("task-group").disabled = isEditing;
  document.getElementById("task-end-time").disabled = isEditing;
  document.getElementById("task-end-date").disabled = isEditing;

  document.getElementById("edit-button").style.display = isEditing
    ? "block"
    : "none";
  document.getElementById("save-button").style.display = isEditing
    ? "none"
    : "block";
}

//resetowanie trybu edycji zadań (sidebar)
function resetEditMode() {
  document.getElementById("task-name").disabled = true;
  document.getElementById("task-more").disabled = true;
  document.getElementById("task-group").disabled = true;
  document.getElementById("task-end-time").disabled = true;
  document.getElementById("task-end-date").disabled = true;

  document.getElementById("edit-button").style.display = "block";
  document.getElementById("save-button").style.display = "none";
}

//potwierdzenie zmian w edycji zadania (sidebar)
async function saveTask() {
  const task_name = document.getElementById("task-name").value || null;
  const task_more = document.getElementById("task-more").value || null;
  const task_group = document.getElementById("task-group").value || null;
  const task_end_time = document.getElementById("task-end-time").value || null;
  const task_end_date = document.getElementById("task-end-date").value || null;

  const updatedTask = {
    task_name,
    task_more,
    task_group,
    task_end_time,
    task_end_date,
  };

  try {
    const response = await fetch(`/task/${currentTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    if (response.ok) {
      console.log("Task updated successfully");
      editTask(); // Przełączenie trybu edycji
      loadTaskGroups(); // odświerzanie grupy w lewym sidebarze
      showTasks(currentGroup);
    } else {
      console.error("Error updating task");
    }
  } catch (error) {
    console.error("Błąd zapisywania zadania:", error);
  }
}

//usunięcie zadania po potwierdzeniu (sidebar, modal)
function deleteTask() {
  const deleteConfirmationModal = new bootstrap.Modal(
    document.getElementById("deleteConfirmationModal")
  );
  deleteConfirmationModal.show();

  document.getElementById("confirmDeleteButton").onclick = async function () {
    try {
      const response = await fetch(`/task/${currentTaskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Zadanie zostało usunięte.");
        toggleRightSidebar(false); //zamyka sidebar
        showTasks(); //odświeża listę zadań po usunięciu
        loadTaskGroups(); // odświerzanie grupy w lewym sidebarze
        deleteConfirmationModal.hide();
      } else {
        console.error("Błąd usuwania zadania.");
      }
    } catch (error) {
      console.error("Błąd usuwania zadania:", error);
    }
  };
}

// Wywołanie `showTasks()` bez filtra przy pierwszym załadowaniu
document.addEventListener("DOMContentLoaded", () => {
  showTasks();
  loadTaskGroups();
});
