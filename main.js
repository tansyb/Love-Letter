const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
  });

  win.loadFile('client/index.html'); // loads your existing page
}

app.whenReady().then(createWindow);