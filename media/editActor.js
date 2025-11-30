// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () 
{
  const vscode = acquireVsCodeApi();

  const currentActorId = 1; 

  const actorIdTitle = document.getElementById("actor-id");
  
  // @ts-ignore
  actorIdTitle.textContent = "Actor " + currentActorId.toString(); 

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
        vscode.postMessage({"newNickName": nicknameField?.value, command:"updateActorName", id:1});
    });


  window.addEventListener('message', event =>
	{
		const message = event.data; // The json data that the extension sent

		switch (message.command) {
            
		}
	});	
})(); 