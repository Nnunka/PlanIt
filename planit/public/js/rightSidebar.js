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
    await loadFilesForTask(taskId);
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

async function loadSubtasks(taskId) {
  try {
    const response = await fetch(`/tasks/${taskId}/subtasks`);
    const data = await response.json();

    const subtasksList = document.getElementById("subtasks-list");
    subtasksList.innerHTML = ""; // Wyczyść listę

    data.subtasks.forEach((subtask) => {
      const listItem = document.createElement("li");
      listItem.className = "section-list-item";

      // Checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = subtask.subtask_completed === 1;
      checkbox.classList.add("subtask-checkbox"); // Specjalna klasa dla mniejszego checkboxa
      checkbox.onchange = async () => {
        await updateSubtaskStatus(subtask.subtask_id, checkbox.checked ? 1 : 0);
      };

      // Nazwa podzadania
      const label = document.createElement("label");
      label.textContent = subtask.subtask_name;

      // Przycisk usuwania
      const deleteButton = document.createElement("button");
      deleteButton.className = "section-delete-btn";
      deleteButton.innerHTML = "&#10005;"; // Ikona "X"
      deleteButton.onclick = async () => {
        await deleteSubtask(subtask.subtask_id);
      };

      // Dodaj elementy do listy
      listItem.appendChild(checkbox);
      listItem.appendChild(label); // Nazwa obok checkboxa
      listItem.appendChild(deleteButton);
      subtasksList.appendChild(listItem);
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
    showTasks(currentGroup);
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

async function deleteSubtask(subtaskId) {
  try {
    await fetch(`/subtasks/${subtaskId}`, {
      method: "DELETE",
    });

    // Po usunięciu podzadania, odśwież listę podzadań i listę zadań
    loadSubtasks(currentTaskId);
    showTasks(currentGroup);
  } catch (error) {
    console.error("Błąd usuwania podzadania:", error);
  }
}

// Load files for the selected task
async function loadFilesForTask(taskId) {
  try {
    const response = await fetch(`/tasks/${taskId}/files`);
    const data = await response.json();

    const fileList = document.getElementById("file-list");
    fileList.innerHTML = ""; // Wyczyść listę

    data.files.forEach((file) => {
      const listItem = document.createElement("li");
      listItem.className = "section-list-item";

      // Link do pliku
      const fileLink = document.createElement("a");
      fileLink.href = `/files/${file.file_id}/download`;
      fileLink.textContent = file.file_name;
      fileLink.classList.add("file-link");

      // Przycisk usuwania
      const deleteButton = document.createElement("button");
      deleteButton.className = "section-delete-btn";
      deleteButton.innerHTML = "&#10005;"; // Ikona "X"
      deleteButton.onclick = async () => {
        await deleteFile(file.file_id);
      };

      // Dodaj elementy do listy
      listItem.appendChild(fileLink);
      listItem.appendChild(deleteButton);
      fileList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Błąd ładowania załączników:", error);
  }
}

// Upload a file for the selected task
document.getElementById("file-upload-form").onsubmit = async (event) => {
  event.preventDefault();

  const fileInput = document.getElementById("file-input");
  if (!fileInput.files.length || !currentTaskId) {
    alert("Wybierz plik i upewnij się, że wybrano zadanie.");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch(`/tasks/${currentTaskId}/files`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      loadFilesForTask(currentTaskId); // Refresh the file list
      showTasks(currentGroup);
      fileInput.value = ""; // Clear file input
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

// Delete a file
async function deleteFile(fileId) {
  try {
    const response = await fetch(`/files/${fileId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadFilesForTask(currentTaskId); // Refresh the file list
      showTasks(currentGroup);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}
