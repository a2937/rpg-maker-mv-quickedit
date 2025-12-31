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

  const eventCodeUpdateButton = document.getElementById("update-codes"); 



  autoPlayBGMElement?.addEventListener("click", () =>
  {
      // @ts-ignore
      vscode.postMessage({"useBGM": autoPlayBGMElement?.checked, command:"togglePlayBGM"});
  });

  eventCodeUpdateButton?.addEventListener("click", () =>
  {
    let data = []; 
    // @ts-ignore
    const tableRows = eventCodeTableBody.querySelectorAll("tr"); 
    if(tableRows != null)
    {
        for(let rowCount = 0; rowCount < tableRows.length; rowCount++)
        {
            let tableRow = tableRows.item(rowCount); 
            let newCode = {code: 0, indent:0, parameters:[]}; 
            // @ts-ignore
            newCode.code = tableRow.children[0].children[0].value;
            // @ts-ignore
            newCode.indent = tableRow.children[1].children[0].value;
            for(let i = 2; i < tableRow.children.length;i++)
            {
              // @ts-ignore
              newCode.parameters[i - 2] = tableRow.children[i].children[0].value;
            }
            data.push(newCode); 
        }
        vscode.postMessage({command:'updateParameters', codeList: data});
    }
  });


  /**
   * @param {string} mapJSONCode
   * @param {{ [x: string]: any; events: { [x: string]: any; }; }} [mapValue]
   * @param {number} [eventId]
   * @param {number} [pageId]
   */
  function reloadMap(mapJSONCode, mapValue,eventId,pageId) {
    try
    {

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
        // @ts-ignore
        for(let row = 0; row < codeList.length && eventCodeTableBody?.children.length < codeList.length; row++)
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

          //const parametersData = document.createElement("td");
          newTableRow.appendChild(codeData);
          newTableRow.appendChild(indentData);
          if(codeList[row].parameters != null)
            {
                //parametersData.colSpan = codeList[row].parameters.length;    
                //parametersData.style.width = "65%";  
                for(let param = 0; param < codeList[row].parameters.length; param++)
                {
                  let parametersCell = document.createElement("td");
                    let parameterEdit = document.createElement("input");
                    parameterEdit.value = codeList[row].parameters[param]; 

                    parametersCell.appendChild(parameterEdit); 
                    newTableRow.appendChild(parametersCell);
                }
            }

          // @ts-ignore
          eventCodeTableBody.appendChild(newTableRow); 
        }
      }
      catch(ex)
      {
        vscode.postMessage({command:"error", error: ex})
      }
  }

  window.addEventListener('message', event =>
  {
    const message = event.data;
    try
    {
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
  }
  catch(ex)
  {
    // @ts-ignore
    errorElement.innerText = ex; 
    // @ts-ignore
    vscode.postMessage({command:'error',error: ex.message}); 
  }
  }); 
})(); 


