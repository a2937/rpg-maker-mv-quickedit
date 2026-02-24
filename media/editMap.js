// @ts-nocheck
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () {
  const vscode = acquireVsCodeApi();

  const autoPlayBGMElement = document.getElementById("autoplayBGM");

  const autoPlayBGSElement = document.getElementById("autoplayBGS");

  const loopParallaxXElement = document.getElementById("loopParallaxX");
  const loopParallaxYElement = document.getElementById("loopParallaxY");

  const parallaxNameElement = document.getElementById("parallaxName");
  const saveParallaxNameElement = document.getElementById("save-parallax-name");

  const mapHeightElement = document.getElementById("map-height");
  const saveMapHeightElement = document.getElementById("save-map-height");

  const mapWidthElement = document.getElementById("map-width");
  const saveMapWidthElement = document.getElementById("save-map-width");

  const tilesetIDElement = document.getElementById("tileset-id");
  const savetilesetIDElement = document.getElementById("save-tileset-id");

  const eventNameEditor = document.getElementById("event-name");

  const eventCodeTableBody = document.getElementById("event-data");

  const pageJSONCode = document.getElementById("page-json");

  const errorElement = document.getElementById("error-message");

  const eventCodeUpdateButton = document.getElementById("update-codes");

  const eventXElement = document.getElementById("event-x");
  const saveEventXButton = document.getElementById("save-event-x");

  const eventYElement = document.getElementById("event-y");
  const saveEventYButton = document.getElementById("save-event-y");

  const nextPageButton = document.getElementById("next-page");
  const previousPageButton = document.getElementById("previous-page");

  const nextEventButton = document.getElementById("next-event");
  const previousEventButton = document.getElementById("previous-event");

  autoPlayBGMElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      useBGM: autoPlayBGMElement?.checked,
      command: "togglePlayBGM",
    });
  });

  autoPlayBGSElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      useBGS: autoPlayBGSElement?.checked,
      command: "togglePlayBGS",
    });
  });

  loopParallaxXElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      loopParallaxX: loopParallaxXElement?.checked,
      command: "toggleLoopParallaxX",
    });
  });

  loopParallaxXElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      loopParallaxY: loopParallaxYElement?.checked,
      command: "toggleLoopParallaxY",
    });
  });

  saveMapHeightElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      mapHeight: mapHeightElement?.value,
      command: "setMapHeight",
    });
  });

  saveMapWidthElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      mapWidth: mapWidthElement?.value,
      command: "setMapWidth",
    });
  });

  savetilesetIDElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      tilesetID: tilesetIDElement?.value,
      command: "setTilesetID",
    });
  });

  nextPageButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({ command: "nextPage" });
  });

  saveParallaxNameElement?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({
      parallaxName: parallaxNameElement?.value,
      command: "setParallaxName",
    });
  });

  saveEventXButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({ x: eventXElement?.value, command: "setEventX" });
  });

  saveEventYButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({ y: eventXElement?.value, command: "setEventY" });
  });

  previousPageButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({ command: "previousPage" });
  });

  nextEventButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({ command: "nextEvent" });
  });

  previousEventButton?.addEventListener("click", () => {
    // @ts-ignore
    vscode.postMessage({ command: "previousEvent" });
  });

  eventCodeUpdateButton?.addEventListener("click", () => {
    let data = [];
    // @ts-ignore
    const tableRows = eventCodeTableBody.querySelectorAll("tr");

    for (let rowCount = 0; rowCount < tableRows.length; rowCount++) {
      let tableRow = tableRows.item(rowCount);
      let newCode = { code: 0, indent: 0, parameters: [] };
      // @ts-ignore
      newCode.code = tableRow.children[0].children[0].value;
      // @ts-ignore
      newCode.indent = tableRow.children[1].children[0].value;
      for (let i = 2; i < tableRow.children.length; i++) {
        // @ts-ignore
        newCode.parameters[i - 2] = tableRow.children[i].children[0].value;
      }
      data.push(newCode);
    }
    vscode.postMessage({ command: "updateParameters", codeList: data });
  });

  /**
   * @param {{ [x: string]: any; events: { [x: string]: any; }; }} [mapValue]
   * @param {number} [eventId]
   * @param {number} [pageId]
   */
  function reloadMap(mapValue, eventId, pageId) {
    // @ts-ignore
    pageJSONCode.innerText = JSON.stringify(
      mapValue.events[eventId].pages[pageId],
      0,
      1.5,
    );

    // @ts-ignore
    autoPlayBGMElement.checked = mapValue["autoplayBgm"] == true;

    // @ts-ignore
    autoPlayBGSElement.checked = mapValue["autoplayBgs"] == true;

    // @ts-ignore
    loopParallaxXElement.checked = mapValue["parallaxLoopX"] == true;

    // @ts-ignore
    loopParallaxYElement.checked = mapValue["parallaxLoopY"] == true;

    // @ts-ignore
    parallaxNameElement.value = mapValue["parallaxName"].trim();

    // @ts-ignore
    tilesetIDElement.value = mapValue["tilesetId"];

    // @ts-ignore
    mapHeightElement.value = mapValue["height"];

    // @ts-ignore
    mapWidthElement.value = mapValue["width"];

    // @ts-ignore
    if (mapValue.events[eventId] == null) {
      return;
    }
    // @ts-ignore
    const event = mapValue.events[eventId];

    // @ts-ignore
    eventNameEditor.value = event.name;

    // @ts-ignore
    eventXElement.value = event.x;

    // @ts-ignore
    eventYElement.value = event.y;

    const page = event.pages[pageId];
    const codeList = page.list;
    const fragment = document.createDocumentFragment();
    // @ts-ignore
    for (let row = 0; row < codeList.length; row++) {
      const newTableRow = document.createElement("tr");

      const codeData = document.createElement("td");
      const codeDropDown = document.createElement("input"); // TODO: Make this a drop down with values. Maybe create a function for it.
      codeDropDown.value = codeList[row].code;
      codeData.appendChild(codeDropDown);

      const indentData = document.createElement("td");
      const indentEdit = document.createElement("input");
      indentEdit.value = codeList[row].indent;
      indentData.appendChild(indentEdit);

      //const parametersData = document.createElement("td");
      newTableRow.appendChild(codeData);
      newTableRow.appendChild(indentData);
      if (
        codeList[row].parameters != null &&
        codeList[row].parameters.length > 0
      ) {
        //parametersData.colSpan = codeList[row].parameters.length;
        //parametersData.style.width = "65%";
        for (let param = 0; param < codeList[row].parameters.length; param++) {
          let parametersCell = document.createElement("td");
          let parameterEdit = document.createElement("input");
          parameterEdit.value = codeList[row].parameters[param];

          parametersCell.appendChild(parameterEdit);
          newTableRow.appendChild(parametersCell);
        }
      }

      // @ts-ignore
      // @ts-ignore
      fragment.appendChild(newTableRow);
    }
    eventCodeTableBody?.replaceChildren(fragment);
  }

  window.addEventListener("message", (event) => {
    const message = event.data;
    try {
      switch (message.command) {
        case "loadMap": {
          const mapJSONCode = message.mapData;
          const mapValue = JSON.parse(mapJSONCode);
          const pageId = message.pageId;
          const eventId = message.eventId;
          reloadMap(mapValue, eventId, pageId);
          break;
        }
        case "update": {
          const mapJSONCode = message.text;
          const mapValue = JSON.parse(mapJSONCode);
          const pageId = message.pageId;
          const eventId = message.eventId;
          vscode.setState({
            mapValue: mapValue,
            pageId: pageId,
            eventId: eventId,
          });
          reloadMap(mapValue, eventId, pageId);
          break;
        }
        default:
          break;
      }
    } catch (ex) {
      console.log(ex);
      // @ts-ignore
      errorElement.innerText = ex.message;

      // @ts-ignore
      vscode.postMessage({ command: "error", error: ex.stack });
    }
  });

  const state = vscode.getState();
  if (state) {
    // @ts-ignore
    reloadMap(state.mapValue, state.eventId, state.pageId);
  }
})();
