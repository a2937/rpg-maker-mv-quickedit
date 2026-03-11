// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  const vscode = acquireVsCodeApi();

  const classIdTitle = document.getElementById("class-id");

  // Data Fields
  const nameField = document.getElementById("name");
  const updateNameButton = document.getElementById("save-name");


  const noteField = document.getElementById("note");
  const updateNoteButton = document.getElementById("save-note");

  const classJSONCode = document.getElementById("class-json");

  const classChooser = document.getElementById("choose-class");

  const nextClassButton = document.getElementById("next-class");

  const previousClassButton = document.getElementById("previous-class");

  previousClassButton?.addEventListener("click", () => {
    vscode.postMessage({ command: "previousClass" });
  });

  nextClassButton?.addEventListener("click", () => {
    vscode.postMessage({ command: "nextClass" });
  });

  updateNameButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      newName: nameField?.value,
      command: "updateClassName",
    });
  });

  updateNoteButton?.addEventListener("click", () =>
  {
    // @ts-ignore
    vscode.postMessage({
      newNote: noteField?.value,
      command: "updateClassNote",
    });
  })

  classChooser?.addEventListener("change", () => {
    // @ts-ignore
    const chosenClass = classChooser.value;
    vscode.postMessage({
      command: "sendClassData",
      selectedClass: chosenClass,
    });
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    // @ts-ignore
    classIdTitle.innerText = JSON.stringify(message);
    switch (message.command) {
      case "update": {
        if (!message.text) {
          return;
        }
        let classValue = JSON.parse(message.text)[message.classId];

        // @ts-ignore
        reloadClassData(classJSONCode, classValue);
        break;
      }
      case "loadClass": {
        if (!message.classData) {
          return;
        }
        let classValue = JSON.parse(message.classData);

        // @ts-ignore
        reloadClassData(classJSONCode, classValue);
      }
      default:
        break;
    }
  });

  /**
   * @param {HTMLElement} classJSONCode
   * @param {{ [x: string]: any; }} classValue
   */
  function reloadClassData(classJSONCode, classValue) {
    // @ts-ignore
    classJSONCode.innerText = JSON.stringify(classValue);
    // @ts-ignore
    classIdTitle.innerText =
      "Class: " + classValue["id"].toString().padStart(3, "0");
    // @ts-ignore
    nameField.value = classValue["name"];

    noteField.value = classValue["note"];
  }
})();
