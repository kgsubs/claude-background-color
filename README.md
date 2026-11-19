# Claude Background Color

A small Chrome extension that lets you pick one background color for claude.ai (chat, Cowork and Code).

It is not affiliated with, endorsed by or sponsored by Anthropic.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions` in Chrome.
3. Turn on *Developer mode* (top right).
4. Click *Load unpacked* and select the repository folder (the one that contains `manifest.json`).
5. Optionally pin the extension from the puzzle-piece menu in the toolbar.

## Use

1. Open claude.ai.
2. Click the extension icon to open the popup.
3. Pick a color in the *Background color* field. Every open claude.ai tab updates right away.
4. Click *Use Claude's own color* to go back to the default.

Your choice is saved in Chrome and syncs across your signed-in Chrome browsers.

## Permission

- `storage`: saves your chosen color (using `chrome.storage.sync`) so it is remembered between visits. The extension runs only on `https://claude.ai/*`. It sends no data anywhere.

## License

MIT. See `LICENSE`.
