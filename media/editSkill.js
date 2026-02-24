// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  const vscode = acquireVsCodeApi();

  const SkillIdTitle = document.getElementById("Skill-id");

  // Data Fields
  const nameField = document.getElementById("name");
  const updateNameButton = document.getElementById("save-name");

  const SkillJSONCode = document.getElementById("Skill-json");

  const SkillChooser = document.getElementById("choose-Skill");

  const nextSkillButton = document.getElementById("next-Skill");

  const previousSkillButton = document.getElementById("previous-Skill");

  previousSkillButton?.addEventListener("click", () => {
    vscode.postMessage({ command: "previousSkill" });
  });

  nextSkillButton?.addEventListener("click", () => {
    vscode.postMessage({ command: "nextSkill" });
  });

  updateNameButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      newName: nameField?.value,
      command: "updateSkillName",
    });
  });

  SkillChooser?.addEventListener("change", () => {
    // @ts-ignore
    const chosenSkill = SkillChooser.value;
    vscode.postMessage({
      command: "sendSkillData",
      selectedSkill: chosenSkill,
    });
  });

  window.addEventListener("message", (event) => {
    const message = event.data;
    // @ts-ignore
    SkillIdTitle.innerText = JSON.stringify(message);
    switch (message.command) {
      case "update": {
        if (!message.text) {
          return;
        }
        let SkillValue = JSON.parse(message.text)[message.SkillId];

        // @ts-ignore
        reloadSkillData(SkillJSONCode, SkillValue);
        break;
      }
      case "loadSkill": {
        if (!message.SkillData) {
          return;
        }
        let SkillValue = JSON.parse(message.SkillData);

        // @ts-ignore
        reloadSkillData(SkillJSONCode, SkillValue);
      }
      default:
        break;
    }
  });

  /**
   * @param {HTMLElement} SkillJSONCode
   * @param {{ [x: string]: any; }} SkillValue
   */
  function reloadSkillData(SkillJSONCode, SkillValue) {
    // @ts-ignore
    SkillJSONCode.innerText = JSON.stringify(SkillValue);
    // @ts-ignore
    SkillIdTitle.innerText =
      "Skill: " + SkillValue["id"].toString().padStart(3, "0");
    // @ts-ignore
    nameField.value = SkillValue["name"];
  }
})();
