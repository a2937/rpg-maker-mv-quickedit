// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () 
{
  const vscode = acquireVsCodeApi();
  const actorIdTitle = document.getElementById("actor-id");

  const nameField = document.getElementById("name");

  const updateNameButton  = document.getElementById("save-name");

  const nicknameField = document.getElementById("nickname"); 
  const updateNickNameButton  = document.getElementById("save-nickname"); 

  const actorJSONCode = document.getElementById("actor-json"); 

  const actorChooser = document.getElementById("actor-chooser"); 

  const nextActorButton = document.getElementById("next-actor"); 

  const previousActorButton = document.getElementById("previous-actor"); 


  previousActorButton?.addEventListener("click", () =>
  {
    vscode.postMessage({command: "previousActor"}); 
  })

  nextActorButton?.addEventListener("click", () =>
  {
    vscode.postMessage({command: "nextActor"}); 
  })

  updateNameButton?.addEventListener("click", () =>
    {
        // @ts-ignore
        vscode.postMessage({"newName": nameField?.value, command:"updateActorName"});
    });

    updateNickNameButton?.addEventListener("click", () =>
    {
        // @ts-ignore
        vscode.postMessage({"newNickName": nicknameField?.value, command:"updateActorNickname"});
    });

    actorChooser?.addEventListener("onchange", () =>
    {
      // @ts-ignore
      const chosenActor = actorChooser.value; 
      vscode.postMessage({command: "sendActorData", selectedActor: chosenActor}); 
    });

    window.addEventListener('message', event =>
    {
      const message = event.data;
      // @ts-ignore
      actorIdTitle.innerText = JSON.stringify(message); 
      switch(message.command)
      {
        case 'update':
        {
          let actorValue = JSON.parse(message.text)[message.actorId];

          // @ts-ignore
          actorIdTitle.innerText = "Actor: " + actorValue["id"].padLeft(3,"0"); 
          // @ts-ignore
          actorJSONCode.innerText = JSON.stringify(actorValue); 
          // @ts-ignore
          nameField.value =  actorValue["name"];

          // @ts-ignore
          nicknameField.value = actorValue["nickname"];
          // @ts-ignore
          //actorIdTitle?.textContent = "Actor " ; 
          // @ts-ignore
         // nicknameField.value = actorValue["nickname"];
          // @ts-ignore
          //nameField.value = actorValue["name"];  
          break; 
        }
        case 'loadActor':
        {
            let actorValue = JSON.parse(message.actorData);
            // @ts-ignore
            actorIdTitle.innerText = "Actor: " + actorValue["id"].padLeft(3,"0"); 
            // @ts-ignore
            actorJSONCode.innerText = JSON.stringify(actorValue); 
            // @ts-ignore
            nameField.value =  actorValue["name"];
  
            // @ts-ignore
            nicknameField.value = actorValue["nickname"];
        }
        default:
          break; 
      }
    }); 
})(); 