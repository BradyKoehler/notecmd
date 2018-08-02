const {
  app,
  BrowserWindow
} = require('electron')
const {
  spawn
} = require('child_process')
const {
  ipcMain
} = require('electron')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadFile('index.html')

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('cwd', (event) => {
  event.sender.send('cwd', process.cwd())
})

ipcMain.on('msg', (event, arg) => {
  let cmd = arg.split(' ')

  const child = spawn(cmd[0], cmd.slice(1))

  child.stdout.on('data', (chunk) => {
    event.sender.send('asynchronous-reply', chunk)
  })

  if (child.error) {
    child.error.on('data', (chunk) => {
      event.sender.send('asynchronous-reply', chunk)
    })
  }

  if (child.stderr) {
    child.stderr.on('data', (chunk) => {
      event.sender.send('asynchronous-reply', chunk)
    })
  }

  child.on('close', (code) => {
    event.sender.send('cwd', process.cwd())
  })
})
