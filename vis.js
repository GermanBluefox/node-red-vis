/**
 * Copyright 2015 Urbiworx.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var io = require("socket.io");
var fs = require("fs");

module.exports = function(RED) {
    "use strict";
    var server = null;
    var base = RED.settings.userDir || process.env.NODE_RED_HOME;
    var nodes = [];
    var language = 'en';
	var node_modules = __dirname + '/node_modules/';
	
	if (!fs.existsSync(node_modules + 'iobroker.vis')) {
		// may be npm 3.0
		node_modules = __dirname + '/../';
		if (!fs.existsSync(node_modules + 'iobroker.vis')) {
			console.error('Cannot find iobroker.vis');
		}
	}
    
    if (base && base[base.length - 1] != '/' && base[base.length - 1] != '\\') {
    	base += '/';
    }

    function getMime(filename) {
        var ext = filename.match(/\.[^.]+$/);
        if (typeof ext == 'object') ext = ext[0];
        var isBinary = false;
        var _mimeType;

        if (ext == '.css') {
            _mimeType = 'text/css';
        } else if (ext == '.bmp') {
            _mimeType = 'image/bmp';
            isBinary = true;
        } else if (ext == '.png') {
            isBinary = true;
            _mimeType = 'image/png';
        } else if (ext == '.jpg') {
            isBinary = true;
            _mimeType = 'image/jpeg';
        } else if (ext == '.jpeg') {
            isBinary = true;
            _mimeType = 'image/jpeg';
        } else if (ext == '.gif') {
            isBinary = true;
            _mimeType = 'image/gif';
        } else if (ext == '.tif') {
            isBinary = true;
            _mimeType = 'image/tiff';
        } else if (ext == '.js') {
            _mimeType = 'application/javascript';
        } else if (ext == '.html') {
            _mimeType = 'text/html';
        } else if (ext == '.htm') {
            _mimeType = 'text/html';
        } else if (ext == '.json') {
            _mimeType = 'application/json';
        } else if (ext == '.xml') {
            _mimeType = 'text/xml';
        } else if (ext == '.svg') {
            _mimeType = 'image/svg+xml';
        } else if (ext == '.eot') {
            isBinary = true;
            _mimeType = 'application/vnd.ms-fontobject';
        } else if (ext == '.ttf') {
            isBinary = true;
            _mimeType = 'application/font-sfnt';
        } else if (ext == '.woff') {
            isBinary = true;
            _mimeType = 'application/font-woff';
        } else if (ext == '.wav') {
            isBinary = true;
            _mimeType = 'audio/wav';
        } else if (ext == '.mp3') {
            isBinary = true;
            _mimeType = 'audio/mpeg3';
        } else if (ext == '.avi') {
            isBinary = true;
            _mimeType = 'video/avi';
        } else if (ext == '.mp4') {
            isBinary = true;
            _mimeType = 'video/mp4';
        } else if (ext == '.mkv') {
            isBinary = true;
            _mimeType = 'video/mkv';
        } else if (ext == '.ogg') {
            isBinary = true;
            _mimeType = 'audio/ogg';
        } else {
            _mimeType = 'text/javascript';
        }

        return {isBinary: isBinary, mimeType: _mimeType, ext: ext};
    }

    function mkpathSync(rootpath, dirpath) {
        // Remove filename
        dirpath = dirpath.split('/');
        dirpath.pop();
        if (!dirpath.length) return;

        for (var i = 0; i < dirpath.length; i++) {
            rootpath += dirpath[i] + '/';
            if (!fs.existsSync(rootpath)) {
                fs.mkdirSync(rootpath);
            }
        }
    }

    function socketEvents(socket, user) {

        socket.on('name', function (name) {
            // console.log('Connected ' + name);
        });

        socket.on('authenticate', function (user, pass, callback) {
            if (typeof user == 'function') {
                callback = user;
                user = undefined;
            }
            if (callback) callback(true, false);
        });

        /*
         *      objects
         */
        socket.on('getObject', function (id, callback) {
            //console.log('getObject ' + id);
            if (id == 'system.config') {
                if (callback) callback(null, {common: {language: language}});
            } else if (callback) {
                callback(null, {});
            }
        });

        socket.on('getObjects', function (callback) {
            if (callback) callback(null, {});
        });

        socket.on('subscribe', function (pattern, callback) {
            // console.log('subscribe');
            // subscribe(this, 'stateChange', pattern)
        });

        socket.on('unsubscribe', function (pattern, callback) {
            // console.log('unsubscribe');
            // unsubscribe(this, 'stateChange', pattern)
        });

        socket.on('getObjectView', function (design, search, params, callback) {
            // console.log('getObjectView ' + design + ' ' + search + ' ' + JSON.stringify(params));
            // that.adapter.objects.getObjectView(design, search, params, callback);
            if (callback) callback(null, {rows: []});
        });
        // TODO check user name
        socket.on('setObject', function (id, obj, callback) {
            //console.log('setObject ' + id);
            //that.adapter.setForeignObject(id, obj, callback);
        });
        /*
         *      states
         */
        socket.on('getStates', function (pattern, callback) {
			if (typeof pattern == 'function') {
				callback = pattern;
				pattern = null;
			}
		
            //console.log('getStates');
            //that.adapter.getForeignStates('*', callback);
            if (callback) callback(null, {});
        });

        socket.on('getState', function (id, callback) {
            //console.log('getState ' + id);
//            that.adapter.getForeignState(id, callback);
        });

        socket.on('setState', function (id, state, callback) {
            for (var i = 0; i < nodes.length; i++) {
                nodes[i].send({topic: id, payload: state});
            }
        });

        socket.on('getVersion', function (callback) {
            if (typeof callback === 'function') callback('0.0.1');
        });

        /*
         *      History
         */
        socket.on('getStateHistory', function (id, start, end, callback) {
            //console.log('getStateHistory');
            //that.adapter.getForeignStateHistory(id, start, end, callback);
        });

        // HTTP
        socket.on('httpGet', function (url, callback) {
            //if (!request) request = require('request');
            //console.log('httpGet');
            //request(url, callback);
        });

        // iobroker commands
        // Todo check user name
        socket.on('sendTo', function (adapterInstance, command, message, callback) {
            //console.log('sendTo');
            //that.adapter.sendTo(adapterInstance, command, message, callback);
        });

        socket.on('authEnabled', function (callback) {
            //console.log('authEnabled');
            //callback(that.adapter.config.auth);
            callback(false);
        });

        socket.on('readFile', function (_adapter, fileName, callback) {
            //console.log('readFile ' + _adapter + ' ' + fileName);
            if (fs.existsSync(base + (_adapter ? _adapter + '/': '') + fileName)) {
                if (callback) callback(null, fs.readFileSync(base + (_adapter ? _adapter + '/': '') + fileName).toString());
            } else {
                if (callback) callback('Not exist', null);
            }
        });

        socket.on('readFile64', function (_adapter, fileName, callback) {
            //console.log('readFile64 ' + fileName);
            if (fs.existsSync(base + (_adapter ? _adapter + '/': '')+ fileName)) {
                if (callback) callback(null, fs.readFileSync(base + (_adapter ? _adapter + '/': '') + fileName).toString('base64'));
            } else {
                if (callback) callback('Not exist', null);
            }
        });

        socket.on('writeFile64', function (_adapter, fileName, data64, options, callback) {
            //console.log('writeFile64 ' + fileName);
            if (!fs.existsSync(base)) fs.mkdirSync(base);

            mkpathSync(base, (_adapter ? _adapter + '/': '') + fileName);

            try {
                var buffer = new Buffer(data64, 'base64');
                var info   = getMime(fileName);
                fs.writeFileSync(base + (_adapter ? _adapter + '/': '') + fileName, buffer, {'flags': 'w', 'encoding': info.isBinary ? 'binary' : 'utf8'});
            } catch (e) {
                console.log(JSON.stringify(e));
                if (callback) callback(e);
                return;
            }
            if (callback) callback();
        });

        socket.on('readDir', function (_adapter, dirName, options, callback) {
            //console.log('readDir ' + _adapter + ' ' + dirName);
            if (fs.existsSync(base + (_adapter ? _adapter + '/' : '') + dirName)) {
                try {
                    var files = fs.readdirSync(base + (_adapter ? _adapter + '/' : '') + dirName);
                    files.sort();
                    var res = [];
                    for (var i = 0; i < files.length; i++) {
                        var stats = fs.statSync(base + (_adapter ? _adapter + '/' : '') + (dirName ? dirName + '/' : '') + files[i]);
                        res.push({file: files[i], stats: stats, isDir: stats.isDirectory()})
                    }

                    if (callback) callback(null, res);
                } catch (e) {
                    if (callback) callback(e, []);
                }
            } else {
                if (callback) callback('Not exists', []);
            }
        });

        socket.on('disconnect', function () {
            //console.log('disonnect');
            //unsubscribeSocket(this, 'stateChange');
            //if (!that.infoTimeout) that.infoTimeout = setTimeout(updateConnectedInfo, 1000);
        });

        socket.on('reconnect', function () {
            //console.log('reconnect');
            //subscribeSocket(this, 'stateChange');
        });

        socket.on('writeFile', function (_adapter, fileName, data, options, callback) {
            //console.log('writeFile ' + _adapter + ' ' + fileName);
            if (!fs.existsSync(base)) fs.mkdirSync(base);
            mkpathSync(base, (_adapter ? _adapter + '/' : '') + fileName);

            try {
                var info = getMime(fileName);
                fs.writeFileSync(base + (_adapter ? _adapter + '/' : '') + fileName, data, {'flags': 'w', 'encoding': info.isBinary ? 'binary' : 'utf8'});
            } catch (e) {
                console.log(JSON.stringify(e));
                if (callback) callback(e);
                return;
            }
            if (callback) callback();
        });

        socket.on('unlink', function (_adapter, name, callback) {
            //console.log('unlink ' + _adapter + ' ' + name);
            if (fs.existsSync(base + (_adapter ? _adapter + '/' : '') + name)) {
                try {
                    var stat = fs.statSync(base + (_adapter ? _adapter + '/' : '') + name);
                    if (stat.isDirectory()) {
                        // TODO recursive deletion
                        fs.rmdirSync(base + (_adapter ? _adapter + '/' : '') + name);
                    } else {
                        fs.unlinkSync(base + (_adapter ? _adapter + '/' : '') + name);
                    }
                    if (callback) callback();
                } catch (e) {
                    if (callback) callback(e);
                }
            }
        });

        socket.on('rename', function (_adapter, oldName, newName, callback) {
            //console.log('rename ' + _adapter + ' ' + oldName);
            if (fs.existsSync(base + (_adapter ? _adapter + '/' : '') + oldName)) {
                try {
                    fs.renameSync(base + (_adapter ? _adapter + '/' : '') + oldName, base + (_adapter ? _adapter + '/' : '') + newName);
                    if (callback) callback();
                } catch (e) {
                    if (callback) callback(e);
                }
            }
        });

        socket.on('mkdir', function (_adapter, dirname, callback) {
            //console.log('mkdir ' + _adapter + ' ' + dirname);
            if (!fs.existsSync(base + (_adapter ? _adapter + '/' : '') + dirname)) {
                try {
                    fs.mkdirSync(base + (_adapter ? _adapter + '/' : '') + dirname);
                    if (callback) callback();
                } catch (e) {
                    if (callback) callback(e);
                }
            }
        });
        socket.on('listPermissions', function (callback) {
            var commandsPermissions = {
                getObject:          {type: 'object',    operation: 'read'},
                getObjects:         {type: 'object',    operation: 'list'},
                getObjectView:      {type: 'object',    operation: 'list'},
                setObject:          {type: 'object',    operation: 'write'},
                subscribeObjects:   {type: 'object',    operation: 'read'},
                unsubscribeObjects: {type: 'object',    operation: 'read'},

                getStates:          {type: 'state',     operation: 'list'},
                getState:           {type: 'state',     operation: 'read'},
                setState:           {type: 'state',     operation: 'write'},
                getStateHistory:    {type: 'state',     operation: 'read'},
                subscribe:          {type: 'state',     operation: 'read'},
                unsubscribe:        {type: 'state',     operation: 'read'},
                getVersion:         {type: '',          operation: ''},

                httpGet:            {type: 'other',     operation: 'http'},
                sendTo:             {type: 'other',     operation: 'sendto'},
                sendToHost:         {type: 'other',     operation: 'sendto'},

                readFile:           {type: 'file',      operation: 'read'},
                readFile64:         {type: 'file',      operation: 'read'},
                writeFile:          {type: 'file',      operation: 'write'},
                writeFile64:        {type: 'file',      operation: 'write'},
                unlink:             {type: 'file',      operation: 'delete'},
                rename:             {type: 'file',      operation: 'write'},
                mkdir:              {type: 'file',      operation: 'write'},
                readDir:            {type: 'file',      operation: 'list'},

                authEnabled:        {type: '',          operation: ''},
                disconnect:         {type: '',          operation: ''},
                listPermissions:    {type: '',          operation: ''},
                getUserPermissions: {type: 'object',    operation: 'read'}
            };

            if (callback) callback(commandsPermissions);
        });

        socket.on('getUserPermissions', function (callback) {
            if (callback) callback(null, {});
        });
    }

    function publishAll(type, id, obj) {
        if (id === undefined) console.log('Problem');

        var clients = server.sockets.connected;

        for (var i in clients) {
            if (clients.hasOwnProperty(i)) clients[i].emit(type, id, obj);
        }
    }

    function createServer() {
        if (server) return;
        server = io.listen(RED.server);
        server.on('connection', socketEvents);
    }

	function VisNodeSet(n) {
        RED.nodes.createNode(this,n);
        if (n.language) language = n.language;
		var that=this;
        createServer();
		this.on("input",function(msg) {
            publishAll('stateChange', msg.topic, {val: msg.payload, ts: msg.timestamp, ack: (msg.topic != 'vis.control.command')});
		});
        nodes.push(this);
        this.on('close', function() {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i] == that) {
                    nodes.splice(i, 1);
                    break;
                }
            }
        });
    }
	RED.nodes.registerType("vis in",VisNodeSet);

    //TODO: NodeRed doesn't support custom exit points, currently httpNodeRoot MUST NOT be set! 
    RED.httpNode.get('*/_socket/*', function(req, res, next) {
        res.set('Content-Type', 'application/javascript');
        res.send('var socketUrl = ""; var socketSession = "' + '' + '"; var socketNamespace = "vis";');
    });

    // user css files
    RED.httpNode.get('/vis.0/*', function(req, res, next) {
        var file;
        var f = req.url.split('?');

        f[0] = f[0].substring(7);

        file = base + 'vis/' + f[0];
        var info = getMime(file);
        if (fs.existsSync(file)) {
            res.contentType(info.mimeType || 'text/javascript');
            var buffer = fs.readFileSync(file);
            res.send(buffer);
        } else {
            if (info.ext == '.css') {
                res.contentType('text/css');
                res.send('');
            } else {
                res.status(404).send('404 Not found. File ' + req.url + ' not found');
            }
        }
    });

    // web libraries
    RED.httpNode.get('/lib/*', function(req, res, next){
        var f = req.url.split('?');
        var file = node_modules + 'iobroker.web/www' + f[0];
        var info = getMime(file);
        if (fs.existsSync(file)) {
            res.contentType(info.mimeType || 'text/javascript');
            var buffer = fs.readFileSync(file);
            res.send(buffer);
        } else {
            res.status(404).send('404 Not found. File ' + req.url + ' not found');
        }
    });

    RED.httpNode.get('/vis/*', function(req, res, next){
        var file;
        var f = req.url.split('?');
		
        if (f[0] == '/vis' || f[0] == '/vis/') {
            f[0] = 'index.html';
        } else {
            f[0] = f[0].substring(5);
        }
        if (f[0].match(/^lib\/css\/themes\//)) {
            file = node_modules + 'iobroker.web/www/' + f[0];
        } else {
            file = node_modules + 'iobroker.vis/www/' + f[0];
        }

        var info = getMime(file);
        if (fs.existsSync(file)) {
            res.contentType(info.mimeType || 'text/javascript');
            var buffer = fs.readFileSync(file);
            res.send(buffer);
        } else {
            file = base + 'vis/' + f[0];
            if (fs.existsSync(file)) {
                res.contentType(info.mimeType || 'text/javascript');
                var buffer_ = fs.readFileSync(file);
                res.send(buffer_);
            } else {
                if (info.ext == '.css') {
                    res.contentType('text/css');
                    res.send('');
                } else {
                    res.status(404).send('404 Not found. File ' + req.url + ' not found');
                }
            }
        }
	});
};
