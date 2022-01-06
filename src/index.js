const { BrowserWindow } = require('electron').remote
const path = require('path')

/*
********************************** Checklist *********************************************
* Creates a new window that displays logic of checklist application. 

*/

const parseBtn = document.querySelector(".parse");

parseBtn.addEventListener("click", (event) => {
    
    const modalPath = path.join("file://", __dirname, "parse.html");
    let parseWindows = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    parseWindows.on("close", () => { parseWindows = null }); 
    parseWindows.loadURL(modalPath);
    parseWindows.show();
});


/*
********************************** Message *********************************************
* Creates a new window that displays logic of message application.

*/

const messageBtn = document.querySelector(".message");

messageBtn.addEventListener("click", (event) => {
    
    const modalPath = path.join("file://", __dirname, "message.html");
    let parseWindows = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    parseWindows.on("close", () => { parseWindows = null }); 
    parseWindows.loadURL(modalPath);
    parseWindows.show();
});


/*
********************************** Checklist China *********************************************
* Creates a new window that displays logic of checklist china application. 

*/

const parseChinaBtn = document.querySelector(".parse_china");

parseChinaBtn.addEventListener("click", (event) => {
    
    const modalPath = path.join("file://", __dirname, "parse_china.html");
    let parseWindows = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    parseWindows.on("close", () => { parseWindows = null }); 
    parseWindows.loadURL(modalPath);
    parseWindows.show();
});