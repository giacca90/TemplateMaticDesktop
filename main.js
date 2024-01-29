// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, ipcMain, dialog, screen } = require('electron');
const path = require('node:path');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();

function createWindow () {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    icon: path.join(__dirname, 'favicon.ico'),
    webPreferences: {
      zoomFactor: 1.5,
      contextIsolation: false,
      nodeIntegration: true,
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile('ng/dist/browser/index.html')

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
  mainWindow.webContents.on('did-frame-finish-load', () => {
    mainWindow.webContents.setZoomFactor(1.5); 
  });

  ipcMain.on("openDialog", (_event) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    }).then(async (result) => {
      console.log("RUTA: "+result.filePaths);
      store.set('carpetaSeleccionada', result.filePaths[0]);
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        const files = await readFilesInFolder(folderPath);
        mainWindow.webContents.send('archivos-de-carpeta', files);
      }
    })
  })

  ipcMain.on("DialogCSV", (_event) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'showHiddenFiles'],
      filters: [{ name: 'CSV', extensions: ['csv', 'CSV'] },]
    }).then((result) => {
      console.log("CSV: "+result.filePaths);
      store.set('CSV',result.filePaths[0]);
      const file = fs.readFileSync(result.filePaths[0]).toString();
      mainWindow.webContents.send('CSV', file);
    }).catch(err => console.error("Error en DialogCSV: \n"+err))
  })

  ipcMain.on("dialogStatus", (_event) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'showHiddenFiles'],
      filters: [{ name: 'Status', extensions: ['status', 'STATUS', 'Status'] },]
    }).then((result) => {
      store.set("Status", result.filePaths[0]);
      const file = fs.readFileSync(result.filePaths[0]).toString();
      mainWindow.webContents.send('StatusCSV', file);
    }).catch(err => console.error("Error en dialogStatus: \n"+err))
  })

  ipcMain.on("PersistenciaCarpeta", (_event) => {
    const storedFolderPath = store.get('carpetaSeleccionada');
    if(storedFolderPath && storedFolderPath.length > 0) {
      let files = fs.readdirSync(storedFolderPath);
      let result = [];
      for(let file of files) {
        result.push(storedFolderPath+"/"+file)
      }
      mainWindow.webContents.send("Carpeta", result);
    }
  })

  ipcMain.on('PersistenciaCSV', (_event) => {
    const CSVGuardado = store.get('CSV');
    if(CSVGuardado && CSVGuardado.length > 0) {
      const file = fs.readFileSync(CSVGuardado).toString();
      mainWindow.webContents.send('CSVRecuperado', file);
    }
  })

  ipcMain.on("persistenciaStatus", (_event) => {
    console.log("persistencia status");
    const StatusGuardado = store.get('Status');
    console.log("statusguardado: "+StatusGuardado);
    if(StatusGuardado !== undefined && StatusGuardado.length > 0) {
      const file = fs.readFileSync(StatusGuardado).toString();
      console.log("file: "+file)
      mainWindow.webContents.send("StatusRecuperado", file);
    }else{
      mainWindow.webContents.send("StatusRecuperado", null);
    }
  })

  ipcMain.on("busca", (_evento, ruta) => {
    let file = fs.readFileSync(ruta);
    let arraybuffer = file.buffer.slice(
      file.byteOffset,
      file.byteOffset + file.byteLength
    );
    mainWindow.webContents.send('arraybuffer',arraybuffer);
  })

  ipcMain.on("addStatus", (_event, data) => {
    let ruta = store.get("Status");
    if(ruta) {
      let statusString = fs.readFileSync(ruta).toString();
      let nuevoStatus = data+'\n'+statusString;
      fs.writeFileSync(ruta,nuevoStatus);
    }else{
      let nuevoStatus = data;
      fs.writeFileSync(__dirname+'/status.status', nuevoStatus);
      store.set("Status",__dirname+'/status.status')
    }
    
  })

  async function readFilesInFolder(folderPath) {
    const files = [];
    const filenames = fs.readdirSync(folderPath);
  
    for (const filename of filenames) {
      const filePath = path.join(folderPath, filename);
      const fileBuffer = fs.readFileSync(filePath);
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


