import {
  app,
  BrowserWindow,
  Notification,
  Menu,
  dialog,
  // nativeImage
  ipcMain
} from "electron";
import { join } from "path";
import { autoUpdater } from "electron-updater";

import logger from "./utils/logger";
import settings from "./utils/settings";
import { readdirSync } from "fs";
import { processChaseCSV } from "./utils/csv-utils";
import { Finance } from "./utils/types";

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

logger.info("App starting...");
console.log(settings)
settings.set("check", true);
logger.info("Checking if settings store works correctly.");
logger.info(settings.get("check") ? "Settings store works correctly." : "Settings store has a problem.");
console.log(settings)
ipcMain.handle('electron-store-get', async (event, key) => {
  console.log(event)
  return settings.get(key);
});

ipcMain.handle('electron-store-set', async (event, { key, value }) => {
  console.log(event)
  settings.set(key, value);
});
let mainWindow: BrowserWindow | null;
let notification: Notification | null;

// Create a function to open the file explorer dialog
function selectFinancesFolder() {
  const window = BrowserWindow.getFocusedWindow();

  // Show the file explorer dialog
  dialog.showOpenDialog(window!, {
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      // Save the selected folder path to the Electron store
      let financesFolderPath = result.filePaths[0];
      settings.set('financesFolderPath', financesFolderPath);
      mainWindow?.webContents.send('finances-path-changed', financesFolderPath);
      getCSVResults(settings.get('financesFolderPath')).then(results => {
        mainWindow?.webContents.send('finances-loaded', results);
      });
    }
  });
}

async function getCSVResults(dirPath: string): Promise<Finance[]> {
  try {
    let results : Finance[] = [];
    const files = readdirSync(dirPath);
    const csvFilePromises = files.filter(file => file.toLowerCase().endsWith('.csv'))
      .map(file => {
        return processChaseCSV(join(dirPath, file));
      })
    const csvResults = await Promise.all(csvFilePromises);
    for (let csvResult of csvResults) {
      results = results.concat(csvResult);
    }
    return results;
  } catch (error) {
    console.error(`Error reading directory: ${error}`);
    return [];
  }
}

// Create the menu template
const menuTemplate: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Select finances folder',
        click: selectFinancesFolder
      },
      {
        label: 'View Saved Finances',
        click: () => {
          mainWindow?.webContents.send('view-saved-finances');
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  }
];

// Create the menu from the template
const menu = Menu.buildFromTemplate(menuTemplate);

// Set the menu to be the application menu
Menu.setApplicationMenu(menu);

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      devTools: isProd ? false : true,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const url =
    // process.env.NODE_ENV === "production"
    isProd
      ? // in production, use the statically build version of our application
        `file://${join(__dirname, "public", "index.html")}`
      : // in dev, target the host and port of the local rollup web server
        "http://localhost:5000";

  mainWindow.loadURL(url).catch((err) => {
    logger.error(JSON.stringify(err));
    app.quit();
  });

  if (!isProd) mainWindow.webContents.openDevTools();
  let results = await getCSVResults(settings.get('financesFolderPath'));
  console.log(results);
  settings.set('finances', results);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};



app.on("ready", createWindow);

// those two events are completely optional to subscrbe to, but that's a common way to get the
// user experience people expect to have on macOS: do not quit the application directly
// after the user close the last window, instead wait for Command + Q (or equivalent).
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

app.on("web-contents-created", (e, contents) => {
  logger.info(e);
  // Security of webviews
  contents.on("will-attach-webview", (event, webPreferences, params) => {
    logger.info(event, params);
    // Strip away preload scripts if unused or verify their location is legitimate
    delete webPreferences.preload;

    // Disable Node.js integration
    webPreferences.nodeIntegration = false;

    // Verify URL being loaded
    // if (!params.src.startsWith(`file://${join(__dirname)}`)) {
    //   event.preventDefault(); // We do not open anything now
    // }
  });

  contents.on("will-navigate", (event, navigationUrl) => {
    // In dev mode allow Hot Module Replacement
      logger.warn("Stopped attempt to open: " + navigationUrl);
      event.preventDefault();
  });
});

if (isProd)
  autoUpdater.checkForUpdates().catch((err) => {
    logger.error(JSON.stringify(err));
  });

autoUpdater.logger = logger;

autoUpdater.on("update-available", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "Updates are available. Click to download.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
  notification.on("click", () => {
    autoUpdater.downloadUpdate().catch((err) => {
      logger.error(JSON.stringify(err));
    });
  });
});

autoUpdater.on("update-not-available", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "Your software is up to date.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});

autoUpdater.on("update-downloaded", () => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: "The updates are ready. Click to quit and install.",
    silent: true,
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
  notification.on("click", () => {
    autoUpdater.quitAndInstall();
  });
});

autoUpdater.on("error", (err) => {
  notification = new Notification({
    title: "Electron-Svelte-Typescript",
    body: JSON.stringify(err),
    // icon: nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png"),
  });
  notification.show();
});
