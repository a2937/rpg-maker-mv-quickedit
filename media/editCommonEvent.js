// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () 
{
  const vscode = acquireVsCodeApi();
  const eventNameEditor = document.getElementById("event-name");

  const eventCodeTableBody = document.getElementById("event-data");  
  
  const pageJSONCode = document.getElementById("page-json"); 

  const errorElement = document.getElementById("error-message"); 

  const eventCodeUpdateButton = document.getElementById("update-codes"); 


  eventCodeUpdateButton?.addEventListener("click", () =>
  {
    let data = []; 
    // @ts-ignore
    const tableRows = eventCodeTableBody.querySelectorAll("tr"); 

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
  });


  /**
   * @param {number} [eventId]
   * @param {number} [pageId]
   * @param {{ [x: string]: any; "": { [x: string]: any; }; }} eventValue
   */
  function reloadEvent(eventValue,eventId,pageId) {


        // @ts-ignore
        if(eventValue[eventId] == null)
        {
          return ; 
        }        
        
        // @ts-ignore
        pageJSONCode.innerText = JSON.stringify(eventValue[eventId],0,1.5); 

        
        // @ts-ignore
        const event = eventValue[eventId];

        // @ts-ignore
        eventNameEditor.value = event.name; 



        const page = event.pages[pageId]; 
        const codeList = page.list; 
        const fragment = document.createDocumentFragment();
        // @ts-ignore
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

          //const parametersData = document.createElement("td");
          newTableRow.appendChild(codeData);
          newTableRow.appendChild(indentData);
          if(codeList[row].parameters != null && codeList[row].parameters.length > 0)
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
          // @ts-ignore
          fragment.appendChild(newTableRow); 
          
      }
      eventCodeTableBody?.replaceChildren(fragment);
  }

  window.addEventListener('message', event =>
  {
    const message = event.data;
    try
    {
      switch(message.command)
      {
        case 'loadEvent':
        {
          const eventJSONCode = message.eventData; 
          const eventValue = JSON.parse(eventJSONCode); 
          const eventId = message.eventId; 
          reloadEvent(eventValue,eventId);
          break; 
        }
        case 'update':
        {
          const eventJSONCode = message.text; 
          const eventValue = JSON.parse(eventJSONCode); 
          const eventId = message.eventId; 
          vscode.setState({eventValue: eventValue,eventId:eventId });
          reloadEvent(eventValue,eventId);
          break; 
        }
        default:
          break; 
      }
  }
  catch(ex)
  {   
     console.log(ex); 
    // @ts-ignore
    errorElement.innerText = ex.message; 

    // @ts-ignore
    vscode.postMessage({command:'error',error: ex.stack}); 
  }
  }); 

  const state = vscode.getState();
	if (state) {
    // @ts-ignore
    reloadEvent(state.eventValue,state.eventId,state.pageId);
	}
})(); 


