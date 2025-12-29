// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

(function () 
{
  const vscode = acquireVsCodeApi();

 
  const autoPlayBGMElement = document.getElementById("autoplayBGM");


  const pageJSONCode = document.getElementById("page-json"); 


  autoPlayBGMElement?.addEventListener("click", () =>
  {
      // @ts-ignore
      vscode.postMessage({"useBGM": autoPlayBGMElement?.value, command:"togglePlayBGM"});
  });

    window.addEventListener('message', event =>
    {
      const message = event.data;
      // @ts-ignore
      actorIdTitle.innerText = JSON.stringify(message); 
      switch(message.command)
      {
        case 'loadMap':
        {
          const mapValue = JSON.parse(message.mapData); 
          // @ts-ignore
          pageJSONCode.innerText = message.mapData; 
          // @ts-ignore
          autoPlayBGMElement.value = mapValue["autoplayBgm"]; 
        }
        default:
          break; 
      }
    }); 
})(); 


