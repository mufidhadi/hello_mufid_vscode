# hellomufid

![hello mufid](./resource/icon.svg)

Extension "hellomufid" adds a small sidebar and webview panel that fetches and displays short "mupid jokes" from a remote API, allows opening a detailed view, and can insert the fetched text into the active editor.

## Features

![generate jokes](./resource/generate_jokes.gif)
---
Practical features included in this extension:

- **Sidebar view:** A `mupid jokes` view in the Activity Bar that shows a button to fetch jokes and displays results.
- **Detail panel:** Open the fetched jokes in a larger webview panel for nicer reading.
- **Insert into editor:** Insert the fetched text directly into the active editor at the cursor position.
- **Commands:** Adds commands `Hello World` and `Reveal mupid jokes view` (available from the Command Palette).

---

![input to code](./resource/input_to_code.gif)
make your code more fun, you can input generated jokes to code.

---
![open in panel view](./resource/open_in_panel.gif)
facy to enjoy full jokes? you can open it in panel too!

## Requirements

- Internet access to reach the configured API endpoint used by the extension.
- No additional VS Code extensions or external installations required.

If the API is unreachable, the extension will show an error message when attempting to fetch data.

## Extension Settings

This extension does not add any configurable settings via `contributes.configuration`.

## Known Issues

- The extension depends on a remote API; if that service is down or slow, fetching will fail or be delayed.
- Data fetched is posted and displayed as raw text; it may require formatting for some use cases.
- If the view does not appear immediately, run the `Reveal mupid jokes view` command from the Command Palette to open the view.

## Repository

The extension source code and issues can be found at [https://github.com/mufidhadi/hello_mufid_vscode](https://github.com/mufidhadi/hello_mufid_vscode).

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release: adds `mupid jokes` sidebar, fetch/insert actions, and a detail panel.
