import * as vscode from 'vscode';
import { getNonce } from './util';

export class RPGMakerMapEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new RPGMakerMapEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(RPGMakerMapEditorProvider.viewType, provider);
		return providerRegistration;
	}

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    private static readonly viewType = 'rpg-maker-mv-mz-quick-edit-tools.commonEventEditor';

	private static currentEventId = 1; 


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
			console.log("Sending common event JSON from update");
			webviewPanel.webview.postMessage({
				command: 'update',
				text: document.getText(),
				eventId: RPGMakerMapEditorProvider.currentEventId,
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
			const mapObject = this.getDocumentAsJson(document);
			 const eventData = JSON.stringify(mapObject);
			switch (e.command) {
				case 'updateParameters':
				{
					console.log("Updated parameters"); 
					console.log(e.codeList);
					this.updatePageCodes(document, e.codeList)
					break; 
				}
				case 'nextEvent':
				{
					RPGMakerMapEditorProvider.currentEventId++; 
					webviewPanel.webview.postMessage({'eventData': eventData,command: "loadCommonEvent", eventId: RPGMakerMapEditorProvider.currentEventId});
					break; 
				}
				case 'previousEvent':
				{
					RPGMakerMapEditorProvider.currentEventId--; 
					webviewPanel.webview.postMessage({'eventData': eventData,command: "loadCommonEvent", eventId: RPGMakerMapEditorProvider.currentEventId});
					break; 
				}
				case 'error':
				{
					console.log("Error"); 
					console.error(e.error);
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


	private updatePageCodes(document: vscode.TextDocument, codeList: any)
	{
		const json = this.getDocumentAsJson(document);
		json[RPGMakerMapEditorProvider.currentEventId].list  = codeList; 
		return this.updateTextDocument(document, json);
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'editMap.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'reset.css'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'vscode.css'));

		
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'editMap.css'));
		

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

				<title>RPG MV/MZ Common Event Editor</title>
			</head>
			<body>
				<h1>Common Event Editor</h1>

				<br/>
				<br/>
				<button id="next-event">Next Event</button> 
				<button id="previous-event">Previous Event</button> 
				<h3>Event Details</h3> 
				<h4 id="eventId"/><h4>
					<div>
						<input type="text" id="event-name" /> 
						<label for="event-name">Event Name</label>
						<button id="save-event-name">Save Event Name</button>
					</div>	
				<br/>
				<br/>
				<h4>Event Code list</h4>
					<table id="code-table">
					<thead>
						<th>Code</th>
						<th>Indent</th>
						<th>Parameters</th>
					</thead>
					<tbody id="event-data">
						
					</tbody>
					</table>
					<button id="update-codes">Update Event Code</button>
				<label>How the event page looks in the JSON code code</label>
				<code id="page-json"></code>
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
