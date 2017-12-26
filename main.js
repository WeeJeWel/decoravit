const path = require('path');
const url = require('url');
const electron = require('electron');
const settings = require('electron-settings');

const app = electron.app;
const bridge = electron.ipcMain;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

const defaultOpts = {
	indent: 'tab',
	mode: 'javascript'
}

let menu;
let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		titleBarStyle: 'hiddenInset',
		transparent: true,
		vibrancy: 'ultra-dark',
	})

	mainWindow.setTitle('Decoravit');
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'www', 'index.html'),
		protocol: 'file:',
		slashes: true
	}))
	mainWindow.on('closed', function() {
		mainWindow = null
	})

	bridge
		.on('opt', (e, { id, value }) => {
			setOpt( id, value );
		})
		.on('opts', () => {
			mainWindow.show();
		})
		.on('ready', () => {
			let opts = {};
			for( let opt in defaultOpts ) {
				opts[opt] = getOpt(opt);
			}
			mainWindow.webContents.send('opts', opts);
		})

	menu = Menu.buildFromTemplate([
		{
		    label: app.getName(),
		    submenu: [
		    	{
		            role: 'about'
		        },
		        {
		            type: 'separator'
		        },
		        {
		            role: 'services',
		            submenu: []
		        },
		        {
		            type: 'separator'
		        },
		        {
		            role: 'hide'
		        },
		        {
		            role: 'hideothers'
		        },
		        {
		            role: 'unhide'
		        },
		        {
		            type: 'separator'
		        },
		        {
		            role: 'quit'
		        }
		    ]
		},
		{
	        label: 'Edit',
	        submenu: [
		        new MenuItem({
					label: 'Beautify',
					accelerator: 'Alt+Return',
					click: () => {
						mainWindow.webContents.send('action', { event: 'beautify' });
					}
				}),
	            {
	                type: 'separator'
	            },
	        	{
	                role: 'undo'
	            },
	            {
	                role: 'redo'
	            },
	            {
	                type: 'separator'
	            },
	            {
	                role: 'cut'
	            },
	            {
	                role: 'copy'
	            },
	            {
	                role: 'paste'
	            },
	            {
	                role: 'pasteandmatchstyle'
	            },
	            {
	                role: 'delete'
	            },
	            {
	                role: 'selectall'
	            }
	        ]
	    },
	    {
	        label: 'View',
	        submenu: [
		        {
	                role: 'reload'
	            },
	            {
	                role: 'forcereload'
	            },
	            {
	                role: 'toggledevtools'
	            },
	            {
	                type: 'separator'
	            },
	            /*
	            {
	                role: 'resetzoom'
	            },
	            {
	                role: 'zoomin'
	            },
	            {
	                role: 'zoomout'
	            },
	            {
	                type: 'separator'
	            },
	            */
	            {
	                role: 'togglefullscreen'
	            }
	        ]
	    },
	    {
	        role: 'window',
	        submenu: [{
	                role: 'minimize'
	            },
	            {
	                role: 'close'
	            }
	        ]
	    },
	    {
	        role: 'help',
	        submenu: [{
	            label: 'Learn More',
	            click() {
	                require('electron').shell.openExternal('https://electronjs.org')
	            }
	        }]
	    }
	]);
	Menu.setApplicationMenu(menu);

	function getOpt( key ) {
		let value = settings.get(key);
		if( typeof value === 'undefined' ) return defaultOpts[ key ];
		return value;
	}

	function setOpt( key, value ) {
		settings.set(key, value);
	}
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {});
app.on('activate', () => {
	if( mainWindow === null ) {
		createWindow()
	}
})