//wyświetlenie zadań na stronie głównej
async function showTasks() {
  try {
    const response = await fetch("/tasks");
    const data = await response.json();
    const tasks = data.tasks;
    const taskList = document.getElementById("task-list");
    taskList.innerHTML = "";

    tasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.classList.add("task-item");
      taskItem.innerText = task.task_name;

      taskItem.onclick = () => showTaskDetailsAndRightSidebar(task.task_id);

      taskList.appendChild(taskItem);
    });
  } catch (error) {
    console.error("Błąd pobierania zadań:", error);
  }
}

//dodanie nowego zadania na stronie głównej
async function addTask(event) {
  event.preventDefault();

  const taskName = document.getElementById("new-task-name").value;

  try {
    const response = await fetch("/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_name: taskName }),
    });

    if (response.ok) {
      console.log("Zadanie zostało dodane.");
      document.getElementById("new-task-name").value = "";
      showTasks(); //odśwież listę zadań po dodaniu
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
      editTask();
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
        deleteConfirmationModal.hide();
      } else {
        console.error("Błąd usuwania zadania.");
      }
    } catch (error) {
      console.error("Błąd usuwania zadania:", error);
    }
  };
}

document.addEventListener("DOMContentLoaded", showTasks);
