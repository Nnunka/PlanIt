let currentTaskId = null;

// Otwarcie/zamknięcie prawego sidebaru
function toggleRightSidebar(open) {
  const rightSidebar = document.getElementById("sidebar-right");
  const content = document.getElementById("main-content");

  if (open) {
    rightSidebar.classList.add("active");
    content.classList.add("shifted-right");
  } else {
    rightSidebar.classList.remove("active");
    content.classList.remove("shifted-right");
    resetEditMode(); // Reset trybu edycji przy zamykaniu sidebaru
  }
}

// Wyświetlanie szczegółów zadania i otwieranie sidebaru
async function showTaskDetailsAndRightSidebar(taskId) {
  const rightSidebar = document.getElementById("sidebar-right");

  if (taskId === currentTaskId && rightSidebar.classList.contains("active")) {
    toggleRightSidebar(false);
    currentTaskId = null;
    return;
  }

  currentTaskId = taskId;

  try {
    const response = await fetch(`/task/${taskId}`);
    const data = await response.json();

    document.getElementById("task-name").value = data.task_name || "";
    document.getElementById("task-more").value = data.task_more || "";

    // Zainicjuj opcje grup, przekazując wybraną grupę
    await taskGroupOptions(data.task_group || null);

    document.getElementById("task-end-date").value = formatDate(
      data.task_end_date
    );
    document.getElementById("task-end-time").value = data.task_end_time || "";

    toggleRightSidebar(true);

    // Załaduj podzadania dla bieżącego zadania
    await loadSubtasks(taskId);
  } catch (error) {
    console.error("Błąd pobierania szczegółów zadania:", error);
  }
}

// Funkcja formatująca datę w formacie YYYY-MM-DD
function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Funkcja do ładowania podzadań
async function loadSubtasks(taskId) {
  try {
    const response = await fetch(`/tasks/${taskId}/subtasks`);
    const data = await response.json();
    const subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; // Wyczyść listę podzadań

    data.subtasks.forEach((subtask) => {
      const subtaskItem = document.createElement("div");
      subtaskItem.classList.add("subtask-item", "d-flex", "align-items-center");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = subtask.subtask_completed === 1;
      checkbox.classList.add("form-check-input", "me-2");
      checkbox.onchange = async () => {
        await updateSubtaskStatus(subtask.subtask_id, checkbox.checked ? 1 : 0);
      };

      const label = document.createElement("label");
      label.textContent = subtask.subtask_name;
      label.classList.add("form-label");

      subtaskItem.appendChild(checkbox);
      subtaskItem.appendChild(label);
      subtasksList.appendChild(subtaskItem);
    });
  } catch (error) {
    console.error("Błąd ładowania podzadań:", error);
  }
}

// Funkcja do dodawania nowego podzadania
document.getElementById("add-subtask-form").onsubmit = async (e) => {
  e.preventDefault();

  const subtaskName = document.getElementById("new-subtask-name").value;
  if (!currentTaskId || !subtaskName) return;

  try {
    await fetch(`/tasks/${currentTaskId}/subtasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtask_name: subtaskName }),
    });

    document.getElementById("new-subtask-name").value = ""; // Wyczyść pole
    loadSubtasks(currentTaskId); // Odśwież listę podzadań
  } catch (error) {
    console.error("Błąd dodawania podzadania:", error);
  }
};

// Funkcja do aktualizacji statusu podzadania
async function updateSubtaskStatus(subtaskId, completed) {
  try {
    await fetch(`/subtasks/${subtaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subtask_completed: completed }),
    });
  } catch (error) {
    console.error("Błąd aktualizacji statusu podzadania:", error);
  }
}
