// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
//      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('ng/dist/browser/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  ipcMain.on("openDialog", (event) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    }).then(async (result) => {
      console.log("RUTA: "+result.filePaths);
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        const files = await readFilesInFolder(folderPath);
        mainWindow.webContents.send('archivos-de-carpeta', files);
      }
    })
  })

  async function readFilesInFolder(folderPath) {
    const files = [];
    const filenames = await fs.readdir(folderPath);
  
    for (const filename of filenames) {
      const filePath = path.join(folderPath, filename);
      const fileBuffer = await fs.readFile(filePath);
      files.push({
        name: filename,
        ruta: filePath,
        buffer: fileBuffer
      });
    }
    return files;
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.on("Files", (event, files) => {
  console.log("Recibido en Electron: "+typeof files);
}); 



// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(null);


