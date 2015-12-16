'use strict';

var electron = require('electron');
var app = electron.app;
var Menu = electron.Menu;
var BrowserWindow = electron.BrowserWindow;

module.exports.setDevMenu = function() {
  var devMenu = Menu.buildFromTemplate([{
    label: 'Development',
    submenu: [{
      label: 'Reload',
      accelerator: 'CmdOrCtrl+R',
      click: function() {
        BrowserWindow.getFocusedWindow().reloadIgnoringCache();
      }
    }, {
      label: 'Toggle DevTools',
      accelerator: 'Alt+CmdOrCtrl+I',
      click: function() {
        BrowserWindow.getFocusedWindow().toggleDevTools();
      }
    }, {
      label: 'Quit',
      accelerator: 'CmdOrCtrl+Q',
      click: function() {
        app.quit();
      }
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut'
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall'
    }]
  }]);
  Menu.setApplicationMenu(devMenu);
};
