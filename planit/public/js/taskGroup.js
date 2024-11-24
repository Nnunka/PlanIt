async function loadTaskGroups() {
  try {
    const response = await fetch("/tasks/groups");
    const groups = await response.json();

    const taskGroupsList = document.getElementById("task-groups-list");
    taskGroupsList.innerHTML = ""; // Wyczyść listę przed dodaniem nowych grup

    // Dodaj link do wszystkich zadań na początku
    const allTasksLink = document.createElement("li");
    allTasksLink.classList.add("nav-item");
    const allTasksAnchor = document.createElement("a");
    allTasksAnchor.classList.add("nav-link");
    allTasksAnchor.href = "#";
    allTasksAnchor.textContent = "Wszystkie zadania";

    allTasksAnchor.onclick = (event) => {
      event.preventDefault();
      currentGroup = null; // Resetuje filtr grupy
      showTasks(); // Wyświetla wszystkie zadania
    };

    allTasksLink.appendChild(allTasksAnchor);
    taskGroupsList.appendChild(allTasksLink);

    // Dodaj poszczególne grupy zadań do listy
    groups.forEach((group) => {
      const listItem = document.createElement("li");
      listItem.classList.add("nav-item");

      const link = document.createElement("a");
      link.classList.add("nav-link");
      link.href = "#";
      link.textContent = group;

      link.onclick = (event) => {
        event.preventDefault();
        currentGroup = group; // Ustawiamy `currentGroup` na nazwę klikniętej grupy
        showTasks(group); // Wywołanie `showTasks` z nazwą grupy
      };

      listItem.appendChild(link);
      taskGroupsList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Błąd pobierania grup zadań:", error);
  }
}

document.getElementById("all-tasks-link").onclick = (event) => {
  event.preventDefault();
  currentGroup = null; // Resetujemy grupę na `null`, aby pokazać wszystkie zadania
  showTasks(); // Wywołaj `showTasks` bez argumentów, aby wyświetlić wszystkie zadania
};
