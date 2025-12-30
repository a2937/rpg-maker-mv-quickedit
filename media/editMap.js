// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () 
{
  const vscode = acquireVsCodeApi();

  const autoPlayBGMElement = document.getElementById("autoplayBGM");

  const eventNameEditor = document.getElementById("event-name");

  const eventCodeTableBody = document.getElementById("event-data");  
  
  const pageJSONCode = document.getElementById("page-json"); 

  const errorElement = document.getElementById("error-message"); 



  autoPlayBGMElement?.addEventListener("click", () =>
  {
      // @ts-ignore
      vscode.postMessage({"useBGM": autoPlayBGMElement?.checked, command:"togglePlayBGM"});
  });


  /**
   * @param {string} mapJSONCode
   * @param {{ [x: string]: any; events: { [x: string]: any; }; }} [mapValue]
   * @param {number} [eventId]
   * @param {number} [pageId]
   */
  function reloadMap(mapJSONCode, mapValue,eventId,pageId) {
        // @ts-ignore
        pageJSONCode.innerText = mapJSONCode; 
         
        // @ts-ignore
        autoPlayBGMElement.checked = mapValue["autoplayBgm"] == true;
      
        // @ts-ignore
        if(mapValue.events[eventId] == null)
        {
          return ; 
        }
        // @ts-ignore
        const event = mapValue.events[eventId];

        // @ts-ignore
        eventNameEditor.value = event.name; 


        const page = event.pages[pageId]; 
        const codeList = page.list; 
        for(let row = 0; row < codeList.length; row++)
        {
          const newTableRow = document.createElement("tr");
        
          const codeData = document.createElement("td"); 
          const codeDropDown = document.createElement("input"); // TODO: Make this a drop down with values. Maybe create a function for it.
          codeDropDown.value = codeList[row].code; 
          codeData.appendChild(codeDropDown);
        
          const indentData = document.createElement("td"); 
          const indentEdit = document.createElement("input")
          indentEdit.value = codeList[row].indent; 
          indentData.appendChild(indentEdit); 

          const parametersData = document.createElement("td");
          for(let param = 0; param < codeList[row].parameters.length; param++)
          {
              let parameterEdit = document.createElement("input");
              parameterEdit.value = codeList[row].parameters[param]; 
              parametersData.appendChild(parameterEdit); 
          }

          newTableRow.appendChild(codeData);
          newTableRow.appendChild(indentData);
          newTableRow.appendChild(parametersData);

          // @ts-ignore
          eventCodeTableBody.appendChild(newTableRow); 
        }
  }

  window.addEventListener('message', event =>
  {
    const message = event.data;
    switch(message.command)
    {
      case 'loadMap':
      {
        const mapJSONCode = message.mapData; 
        const mapValue = JSON.parse(mapJSONCode); 
        const pageId = message.pageId; 
        const eventId = message.eventId; 
        reloadMap(mapJSONCode,mapValue,eventId,pageId);
        break; 
      }
      case 'update':
      {
        const mapJSONCode = message.text; 
        const mapValue = JSON.parse(mapJSONCode); 
        const pageId = message.pageId; 
        const eventId = message.eventId; 

        reloadMap(mapJSONCode,mapValue,eventId,pageId);
        break; 
      }
      default:
        break; 
    }
  }); 
})(); 


