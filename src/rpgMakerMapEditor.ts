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

    private static readonly viewType = 'rpg-maker-mv-mz-quick-edit-tools.mapEditor';

	private static currentEventId = 1; 

	
	private static currentPageId = 0; 

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
			console.log("Sending map JSON from update");
			webviewPanel.webview.postMessage({
				command: 'update',
				text: document.getText(),
				eventId: RPGMakerMapEditorProvider.currentEventId,
				pageId: RPGMakerMapEditorProvider.currentPageId
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
			 const mapData = JSON.stringify(mapObject);
			switch (e.command) {
				case 'togglePlayBGM':
				{
					console.log("Toggled Play BGM"); 
					this.togglePlayBGM(document,e.useBGM);
					break; 
				}
				case 'togglePlayBGS':
				{
					console.log("Toggled Play BGS"); 
					this.togglePlayBGS(document,e.useBGS);
					break; 
				}
				case 'toggleLoopParallaxX':
				{
					console.log("Toggled Loop Parallax X"); 
					this.toggleLoopParallaxX(document,e.loopParallaxX);
					break; 
				}
				case 'toggleLoopParallaxY':
				{
					console.log("Toggled Loop Parallax Y"); 
					this.toggleLoopParallaxY(document,e.loopParallaxY);
					break; 
				}
				case 'setMapHeight':
				{
					console.log("Updated Map Height"); 
					this.updateMapHeight(document,e.mapHeight); 
					break; 
				}
				case 'setMapWidth':
				{
					console.log("Updated Map Width"); 
					this.updateMapWidth(document,e.mapWidth); 
					break;
				}
				case 'setTilesetID':
				{
					console.log("Updated Tileset ID"); 
					this.updateTilesetID(document,e.tilesetID); 
					break;
				}
				case 'setParallaxName':
				{
					console.log("Set Parallax Name"); 
					this.updateParallaxName(document,e.parallaxName); 
					break;
				}
				case 'setEventX':
				{
					console.log("Set Event X"); 
					this.updateEventX(document,e.x); 
					break;
				}
				case 'setEventY':
				{
					console.log("Set Event Y"); 
					this.updateEventY(document,e.y); 
					break;
				}
				case 'updateParameters':
				{
					console.log("Updated parameters"); 
					console.log(e.codeList);
					this.updatePageCodes(document, e.codeList)
					break; 
				}
				case 'nextPage':
				{
					RPGMakerMapEditorProvider.currentPageId++; 
					webviewPanel.webview.postMessage({'mapData': mapData,command: "loadMap", pageId: RPGMakerMapEditorProvider.currentPageId, eventId: RPGMakerMapEditorProvider.currentEventId});
					break; 
				}
				case 'previousPage':
				{
					RPGMakerMapEditorProvider.currentPageId--; 
					webviewPanel.webview.postMessage({'mapData': mapData,command: "loadMap", pageId: RPGMakerMapEditorProvider.currentPageId, eventId: RPGMakerMapEditorProvider.currentEventId});
					break; 
				}
				case 'nextEvent':
				{
					RPGMakerMapEditorProvider.currentEventId++; 
					webviewPanel.webview.postMessage({'mapData': mapData,command: "loadMap", pageId: RPGMakerMapEditorProvider.currentPageId, eventId: RPGMakerMapEditorProvider.currentEventId});
					break; 
				}
				case 'previousEvent':
				{
					RPGMakerMapEditorProvider.currentEventId--; 
					webviewPanel.webview.postMessage({'mapData': mapData,command: "loadMap", pageId: RPGMakerMapEditorProvider.currentPageId, eventId: RPGMakerMapEditorProvider.currentEventId});
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


	private updateTilesetID(document: vscode.TextDocument, tilesetID: number) {
		const json = this.getDocumentAsJson(document);
		json["tilesetId"] = tilesetID;
		return this.updateTextDocument(document, json);
	}

	private togglePlayBGM(document: vscode.TextDocument,switchState: boolean)
	{
		const json = this.getDocumentAsJson(document);
		json["autoplayBgm"] = switchState;
		return this.updateTextDocument(document, json);
	}

	private togglePlayBGS(document: vscode.TextDocument,switchState: boolean)
	{
		const json = this.getDocumentAsJson(document);
		json["autoplayBgs"] = switchState;
		return this.updateTextDocument(document, json);
	}

	private toggleLoopParallaxX(document: vscode.TextDocument,doLoopX: boolean)
	{
		const json = this.getDocumentAsJson(document);
		json["parallaxLoopX"] = doLoopX;
		return this.updateTextDocument(document, json);
	}

	private toggleLoopParallaxY(document: vscode.TextDocument,doLoopY: boolean)
	{
		const json = this.getDocumentAsJson(document);
		json["parallaxLoopY"] = doLoopY;
		return this.updateTextDocument(document, json);
	}


	private updateMapHeight(document: vscode.TextDocument, newHeight: number)
	{
		const json = this.getDocumentAsJson(document);
		json["height"] = newHeight;
		return this.updateTextDocument(document, json);
	}

	private updateMapWidth(document: vscode.TextDocument, newWidth: number)
	{
		const json = this.getDocumentAsJson(document);
		json["width"] = newWidth;
		return this.updateTextDocument(document, json);
	}

	private updateParallaxName(document: vscode.TextDocument, newParallaxName: string)
	{
		const json = this.getDocumentAsJson(document);
		json["parallaxName"] = newParallaxName;
		return this.updateTextDocument(document, json);
	}

	private updateEventX(document: vscode.TextDocument, eventX: number)
	{
		const json = this.getDocumentAsJson(document);
		json.events[RPGMakerMapEditorProvider.currentEventId]["x"] = eventX;
		return this.updateTextDocument(document, json);
	}

	private updateEventY(document: vscode.TextDocument, eventY: number)
	{
		const json = this.getDocumentAsJson(document);
		json.events[RPGMakerMapEditorProvider.currentEventId]["y"] = eventY; 
		return this.updateTextDocument(document, json);
	}



	private updatePageCodes(document: vscode.TextDocument, codeList: any)
	{
		const json = this.getDocumentAsJson(document);
		json.events[RPGMakerMapEditorProvider.currentEventId].pages[RPGMakerMapEditorProvider.currentPageId].list  = codeList; 
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

				<title>RPG MV/MZ Map Editor</title>
			</head>
			<body>
				<h1>Map Editor</h1>
				<h2>Overview</h2>
				<h3>Map Details</h3> 
					<div>
						<input type="checkbox" id="autoplayBGM" /> 
						<label for="autoplayBGM">Autoplay BGM</label> 
					</div>
					<div>
						<input type="checkbox" id="autoplayBGS" /> 
						<label for="autoplayBGS">Autoplay BGS</label> 
					</div>
					<div>
						<input type="number" id="map-height" min="1" /> 
						<label for="map-height">Map Height</label> 
						<button id="save-map-height">Save Map Height</button>
					</div>
					<div>
						<input type="number" id="map-width" min="1" /> 
						<label for="map-width">Map Width</label> 
						<button id="save-map-width">Save Map Width</button>
					</div>
					<div>
						<input type="checkbox" id="loopParallaxX" /> 
						<label for="loopParallaxX">Loop Parallax X</label> 
					</div>
					<div>
						<input type="checkbox" id="loopParallaxY" /> 
						<label for="loopParallaxX">Loop Parallax Y</label> 
					</div>
					<div>
						<input type="input" id="parallaxName" /> 
						<label for="parallaxName">Parallax Name</label> 
						<button id="save-parallax-name">Save Parallax Name</button>
					</div>
					<div>
						<input type="number" id="tileset-id" min=1 /> 
						<label for="tileset-id">Tileset ID</label> 
						<button id="save-tileset-id">Save Tileset ID</button>
					</div>


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
					<div>
						<input type="text" id="event-note" /> 
						<label for="event-note">Event Note</label>
						<button id="save-event-name">Save Event Note</button>
					</div>
					<div>
						<input type="number" id="event-x" /> 
						<label for="event-x">Event X</label>
						<button id="save-event-x">Save Event X</button>
					</div>
					<div>
						<input type="number" id="event-y" /> 
						<label for="event-y">Event Y</label>
						<button id="save-event-y">Save Event Y</button>
					</div>
				<br/>
				<br/>
				<h3>Page Details</h3> 
				<h4>Conditions</h4>
				<h4>Image</h4>

				<h4>Move Route</h4>


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
				<button id="next-page">Next Page</button> 
				<button id="previous-page">Previous Page</button> 
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
