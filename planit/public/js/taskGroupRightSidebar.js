async function taskGroupOptions(selectedGroup = null) {
  const groupSelect = document.getElementById("task-group");
  groupSelect.innerHTML = "";

  const addNewOption = document.createElement("option");
  addNewOption.value = "add_new";
  addNewOption.textContent = "Dodaj nową grupę";
  groupSelect.appendChild(addNewOption);

  try {
    const response = await fetch("/tasks/groups");
    const groups = await response.json();

    groups.forEach((group) => {
      const option = document.createElement("option");
      option.value = group;
      option.textContent = group;
      if (group === selectedGroup) {
        option.selected = true;
      }
      groupSelect.appendChild(option);
    });

    groupSelect.onchange = function () {
      if (groupSelect.value === "add_new") {
        document.getElementById("new-group-name").value = "";
        const addGroupModal = new bootstrap.Modal(
          document.getElementById("addGroupModal")
        );
        addGroupModal.show();
      }
    };
  } catch (error) {
    console.error("Błąd pobierania grup:", error);
  }
}

document.getElementById("save-group-btn").onclick = function () {
  const newGroupName = document.getElementById("new-group-name").value.trim();
  const groupSelect = document.getElementById("task-group");

  if (newGroupName) {
    const option = document.createElement("option");
    option.value = newGroupName;
    option.textContent = newGroupName;
    option.selected = true;
    groupSelect.appendChild(option);
  } else {
    groupSelect.value = "";
  }

  const addGroupModal = bootstrap.Modal.getInstance(
    document.getElementById("addGroupModal")
  );
  addGroupModal.hide();
};
