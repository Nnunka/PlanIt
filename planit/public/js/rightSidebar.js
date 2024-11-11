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
