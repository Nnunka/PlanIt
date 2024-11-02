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

  // Zamknięcie sidebaru, jeśli kliknięto na to samo zadanie
  if (taskId === currentTaskId && rightSidebar.classList.contains("active")) {
    toggleRightSidebar(false);
    currentTaskId = null;
    return;
  }

  currentTaskId = taskId;

  try {
    // Pobierz szczegóły zadania
    const response = await fetch(`/task/${taskId}`);
    const data = await response.json();

    // Wypełnij pola w sidebarze danymi zadania
    document.getElementById("task-name").value = data.task_name || "";
    document.getElementById("task-more").value = data.task_more || "";
    document.getElementById("task-end-time").value = data.task_end_time || "";
    document.getElementById("task-end-date").value = data.task_end_date || "";

    // Wypełnij listę grup z zaznaczoną bieżącą grupą
    await taskGroupOptions(data.task_group);

    // Otwórz sidebar
    toggleRightSidebar(true);
  } catch (error) {
    console.error("Błąd pobierania szczegółów zadania:", error);
  }
}
