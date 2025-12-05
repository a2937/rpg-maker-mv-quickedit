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
  updateNameButton?.addEventListener("click", () =>
    {
        // @ts-ignore
        vscode.postMessage({"newName": nameField?.value, command:"updateActorName", id:1});
    });

    updateNickNameButton?.addEventListener("click", () =>
    {
        // @ts-ignore
        vscode.postMessage({"newNickName": nicknameField?.value, command:"updateActorNickname", id:1});
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
          let actorValue = JSON.parse(message.text)[1];
          // @ts-ignore
          actorIdTitle.innerText = JSON.stringify(actorValue); 
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
        default:
          break; 
      }
    }); 
    /*
    window.addEventListener('message', event =>
    {
      const message = event.data; // The json data that the extension sent
      // @ts-ignore
      actorIdTitle.innerText = message; 
      // @ts-ignore
      // @ts-ignore
      actorIdTitle.textContent = message; 
      switch (message.command) {
            case 'load':
              const actorData = message.ActorData;
              // @ts-ignore
              actorIdTitle?.textContent = "Actor " + currentActorId.toString(); 
              // @ts-ignore
              nicknameField.value = actorData["nickname"];
              // @ts-ignore
              nameField.value = actorData["name"];  
              break; 
            case 'update':
              let actorValue = JSON.parse(message.text)[1]; 
              // @ts-ignore
              actorIdTitle?.textContent = "Actor " + currentActorId.toString(); 
              // @ts-ignore
              nicknameField.value = actorValue["nickname"];
              // @ts-ignore
              nameField.value = actorValue["name"];  
              break; 
      }
    });
    */ 
})(); 