async function showTasks(group = null) {
  try {
    const url = group ? `/tasks/group/${group}` : "/tasks";
    const response = await fetch(url);
    const data = await response.json();
    const tasks = data.tasks;
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");
      taskItem.innerText = task.task_name;

      if (task.task_completed) {
        taskItem.classList.add("completed");
      }

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.task_completed === 1;
      checkbox.classList.add("task-checkbox");

      checkbox.onclick = async (event) => {
        event.stopPropagation();
        const task_completed = checkbox.checked ? 1 : 0;
        await updateTaskStatus(task.task_id, task_completed);

        if (task_completed) {
          taskItem.classList.add("completed");
        } else {
          taskItem.classList.remove("completed");
        }
      };

      taskItem.appendChild(checkbox);

      taskItem.onclick = (event) => {
        if (event.target === checkbox) return;

        const isAlreadyActive = taskItem.classList.contains("active");

        document.querySelectorAll(".task-item").forEach((item) => {
          item.classList.remove("active");
        });

        if (!isAlreadyActive) {
          taskItem.classList.add("active");
        }

        showTaskDetailsAndRightSidebar(task.task_id);
      };

      taskList.appendChild(taskItem);
    });
  } catch (error) {
    console.error("Błąd pobierania zadań:", error);
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
  const taskGroup = currentGroup || null;

  try {
    const response = await fetch("/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_name: taskName, task_group: taskGroup }),
    });

    if (response.ok) {
      console.log("Zadanie zostało dodane.");
      document.getElementById("new-task-name").value = "";
      showTasks(currentGroup); // Odśwież listę zadań po dodaniu
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
      showTasks(); // odświerzanie grupy w lewym sidebarze
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
document.addEventListener("DOMContentLoaded", () => showTasks());
