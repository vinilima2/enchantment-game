const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

function createWindow() {
    const win = new BrowserWindow({
        width: 1366,
        height: 768,
        resizable: false,
        fullscreen: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: false
        },
        icon: path.join(__dirname, 'assets', 'logo.ico')
    });

    Menu.setApplicationMenu(null);

    win.webContents.on('before-input-event', (event, input) => {
        if (
            (input.alt && input.key === 'ArrowLeft') ||
            (input.meta && input.key === 'ArrowLeft') ||
            (input.key === 'Backspace' && input.type !== 'char')
        ) {
            event.preventDefault();
        }
    });

    win.webContents.on('app-command', (e, cmd) => {
        if (cmd === 'browser-backward') {
            e.preventDefault();
        }
    });

    win.loadFile(path.join(__dirname, 'templates', 'menu.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    app.quit();
});
