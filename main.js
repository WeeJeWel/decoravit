const path = require('path');
const url = require('url');
const electron = require('electron');
const settings = require('electron-settings');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

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
	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
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
	        label: 'Beautify',
	        submenu: [
		        new MenuItem({
					label: 'Beautify',
					accelerator: 'CmdOrCtrl+B',
					click: () => {
						mainWindow.webContents.send('action', 'beautify');
					}
				}),
				{
					type: 'separator',
				},
		        new MenuItem({
					label: 'Indentation',
					type: 'submenu',
					submenu: [
						{
							label: 'Tab',
							type: 'radio',
							checked: settings.get('option.indent') === 'tab',
							click: () => {
								settings.set('option.indent', 'tab');
							}
						},
						{
							label: '2 Spaces',
							type: 'radio',
							checked: settings.get('option.indent') === 'space2',
							click: () => {
								settings.set('option.indent', 'space2');
							},
						},
						{
							label: '3 Spaces',
							type: 'radio',
							checked: settings.get('option.indent') === 'space3',
							click: () => {
								settings.set('option.indent', 'space3');
							},
						},
						{
							label: '4 Spaces',
							type: 'radio',
							checked: settings.get('option.indent') === 'space4',
							click: () => {
								settings.set('option.indent', 'space4');
							},
						},
						{
							label: '8 Spaces',
							type: 'radio',
							checked: settings.get('option.indent') === 'space5',
							click: () => {
								settings.set('option.indent', 'space5');
							},
						}
					]
				}),
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
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {});
app.on('activate', () => {
	if( mainWindow === null ) {
		createWindow()
	}
})