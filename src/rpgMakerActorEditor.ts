import * as vscode from 'vscode';
import { getNonce } from './util';

export class RPGMakerActorEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new RPGMakerActorEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(RPGMakerActorEditorProvider.viewType, provider);
		return providerRegistration;
	}

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    private static readonly viewType = 'rpg-maker-mv-mz-quick-edit-tools.actorEditor';

	private static currentActorId = 1; 

    /**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
    public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				command: 'update',
				text: document.getText(),
				actorId: RPGMakerActorEditorProvider.currentActorId
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			console.log(e); 
			switch (e.command) {
                case 'updateActorName':
				{
					console.log("Updated name"); 
					this.updateActorName(document, e.newName); 
					break; 
				}		
				case 'updateActorNickname':
				{
					console.log("Updated nickname"); 
					this.updateActorNickname(document, e.newNickName); 
					break; 
				}
				case 'sendActorData':
				{
					console.log("Sent actordata"); 
					RPGMakerActorEditorProvider.currentActorId = e.selectedActor; 
					const actorData = this.getDocumentAsJson(document)[RPGMakerActorEditorProvider.currentActorId];
					webviewPanel.webview.postMessage({'actorData': JSON.stringify(actorData),command: "loadActor"});
					break; 
				}
                case 'nextActor':
				{
					console.log("Getting next actor"); 
					let actorList = this.getDocumentAsJson(document);
					if(RPGMakerActorEditorProvider.currentActorId + 1 > actorList.length )
					{
						console.log("Out of bounds error"); 
						// TODO: Make a nice error here 
						return; 
					}
					else 
					{
						RPGMakerActorEditorProvider.currentActorId++; 
						const actorData = JSON.stringify(actorList[RPGMakerActorEditorProvider.currentActorId]);
						console.log("Actor Chosen: " + actorData); 
						webviewPanel.webview.postMessage({'actorData': actorData,command: "loadActor"});
					}
					break; 
				}
                case 'previousActor':
				{
						console.log("Getting previous actor"); 
						if(RPGMakerActorEditorProvider.currentActorId - 1 <= 0 )
						{
							console.error("Out of bounds error"); 
							// TODO: Make a nice error here 
							return; 
						}
						else 
						{
							RPGMakerActorEditorProvider.currentActorId--; 
							const actorData = this.getDocumentAsJson(document)[RPGMakerActorEditorProvider.currentActorId];
							webviewPanel.webview.postMessage({'actorData': JSON.stringify(actorData),command: "loadActor"});
						}
					break; 
				}
				default:
				{
					break; 
				}
			}
		});

		updateWebview();
	}

    private updateActorName(document: vscode.TextDocument, newName: string)
    {
        const json = this.getDocumentAsJson(document);
        json[RPGMakerActorEditorProvider.currentActorId]["name"] = newName; 
        return this.updateTextDocument(document, json);
    }

	private updateActorNickname(document: vscode.TextDocument, newName: string)
    {
        const json = this.getDocumentAsJson(document);
        json[RPGMakerActorEditorProvider.currentActorId]["nickname"] = newName; 
        return this.updateTextDocument(document, json);
    }


	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'editActor.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'reset.css'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'vscode.css'));

		
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'editActor.css'));
		

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();


		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet" />
				<link href="${styleVSCodeUri}" rel="stylesheet" />
				<link href="${styleMainUri}" rel="stylesheet" />

				<title>RPG MV/MZ Actor Editor</title>
			</head>
			<body>
				<h1>Actor Editor</h1>
				<h2 id="actor-id"></h2>
				<div class="form">
					<div>
						
						<input type="text" id="name" /> 
						<label for="name">Name</label>
						<button id="save-name">Save Name</button>
					</div>
					<div>
						<input type="text" id="nickname" /> 
						<label for="name">Nickname</label>
						<button id="save-nickname">Save Nickname</button>
					</div>
					<div>
						<input min="1" type="number" id="choose-actor" value=1 />
						<label for="choose-actor">Jump to actor id</label>
					</div>
					<div>
						<button id="next-actor">Next Actor</div>
						<button id="previous-actor">Previous Actor</div>
					</div>
				</div> 
				<label>How the actor looks in the JSON code code</label>
				<code id="actor-json"></code>
				<p id="error-message"></p> 
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}


    /**
	 * Try to get a current document as json text.
	 */
	private getDocumentAsJson(document: vscode.TextDocument): any {
		const text = document.getText();
		if (text.trim().length === 0) {
			return {};
		}

		try {
			return JSON.parse(text);
		} catch {
			throw new Error('Could not get document as json. Content is not valid json');
		}
	}

    /**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, json: any) {
		const edit = new vscode.WorkspaceEdit();

		// Just replace the entire document every time for this example extension.
		// A more complete extension should compute minimal edits instead.
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			JSON.stringify(json, null, 2));

		return vscode.workspace.applyEdit(edit);
	}
    
}