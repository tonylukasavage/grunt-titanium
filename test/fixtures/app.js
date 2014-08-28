var win = Ti.UI.createWindow({
	backgroundColor: '#f5f5f5',
	exitOnClose: true,
	fullscreen: false
});
win.add(Ti.UI.createLabel({
	text: require('foo/bar')
}));
win.open();