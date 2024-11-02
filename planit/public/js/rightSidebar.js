let currentTaskId = null;

//otwieranie/zamykanie prawego sidebaru
function toggleRightSidebar(open) {
  const rightSidebar = document.getElementById("sidebar-right");
  const content = document.getElementById("main-content");

  if (open) {
    rightSidebar.classList.add("active");
    content.classList.add("shifted-right");
  } else {
    rightSidebar.classList.remove("active");
    content.classList.remove("shifted-right");
  }
}

//wyświetla szczegółów zadania i otwieranie/zamykanie sidebaru
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
    document.getElementById("task-group").value = data.task_group || "";
    document.getElementById("task-end-time").value = data.task_end_time || "";
    document.getElementById("task-end-date").value = data.task_end_date || "";

    toggleRightSidebar(true);
  } catch (error) {
    console.error("Błąd pobierania szczegółów zadania:", error);
  }
}
