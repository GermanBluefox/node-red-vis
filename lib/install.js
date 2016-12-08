var fs = require('fs');
var install;
if (fs.existsSync(__dirname + '/../node_modules/iobroker.vis/lib/install.js')) {
	install = require(__dirname + '/../node_modules/iobroker.vis/lib/install.js');
} else if (fs.existsSync(__dirname + '/../../iobroker.vis/lib/install.js')) { // npm 3 behaviour
	install = require(__dirname + '/../../iobroker.vis/lib/install.js');
}
install();