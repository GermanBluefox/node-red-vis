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
    var subscribes = {};
    var settings = require(process.env.NODE_RED_HOME+"/red/red").settings;
    var base = (settings.get("userDir") || (__dirname + '/../node-red/')) + 'vis/';
    var nodes = [];

    function initSocket(socket) {
        socketEvents(socket);
    }

    function publish(socket, type, id, obj) {
        socket.emit(type, id, obj);
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
    };

    function socketEvents(socket, user) {
        // TODO Check if user may create and delete objects and so on
        socket.on('name', function (name) {
            console.log('Connected ' + name);
        });

        /*
         *      objects
         */
        socket.on('getObject', function (id, callback) {
            console.log('getObject ' + id);
            if (id == 'system.config') {
                if (callback) callback(null, {common: {language: 'en'}});
            } else if (callback) {
                callback(null, {});
            }
        });

        socket.on('getObjects', function (callback) {
            console.log('getObjects');
            //that.adapter.getForeignObjects('*', callback);
            if (callback) callback(null, {});
        });

        socket.on('subscribe', function (pattern) {
            console.log('subscribe');
            //subscribe(this, 'stateChange', pattern)
        });

        socket.on('unsubscribe', function (pattern) {
            console.log('unsubscribe');
            //unsubscribe(this, 'stateChange', pattern)
        });

        socket.on('getObjectView', function (design, search, params, callback) {
            console.log('getObjectView ' + design + ' ' + search + ' ' + JSON.stringify(params));
            //that.adapter.objects.getObjectView(design, search, params, callback);
            if (callback) callback(null, {rows: []});
        });
        // TODO check user name
        socket.on('setObject', function (id, obj, callback) {
            console.log('setObject ' + id);
            //that.adapter.setForeignObject(id, obj, callback);
        });
        /*
         *      states
         */
        socket.on('getStates', function (callback) {
            console.log('getStates');
            //that.adapter.getForeignStates('*', callback);
            if (callback) callback(null, {});
        });

        socket.on('getState', function (id, callback) {
            console.log('getState');
//            that.adapter.getForeignState(id, callback);
        });
        // Todo check user name
        socket.on('setState', function (id, state, callback) {
            console.log('setState');
            for (var i = 0; i < nodes.length; i++) {
                nodes.send({topic: id, payload: state});
            }
        });

        socket.on('getVersion', function (callback) {
            console.log('getVersion');
            if (typeof callback === 'function') callback('0.0.1');
        });

        /*
         *      History
         */
        socket.on('getStateHistory', function (id, start, end, callback) {
            console.log('getStateHistory');
            //that.adapter.getForeignStateHistory(id, start, end, callback);
        });

        // HTTP
        socket.on('httpGet', function (url, callback) {
            //if (!request) request = require('request');
            console.log('httpGet');
            //request(url, callback);
        });

        // iobroker commands
        // Todo check user name
        socket.on('sendTo', function (adapterInstance, command, message, callback) {
            console.log('sendTo');
            //that.adapter.sendTo(adapterInstance, command, message, callback);
        });

        socket.on('authEnabled', function (callback) {
            console.log('authEnabled');
            //callback(that.adapter.config.auth);
        });

        socket.on('readFile', function (_adapter, fileName, callback) {
            console.log('readFile ' + fileName);
            if (fs.existsSync(base + fileName)) {
                if (callback) callback(null, fs.readFileSync(base + fileName).toString());
            } else {
                if (callback) callback('Not exist', null);
            }
        });

        socket.on('readFile64', function (_adapter, fileName, callback) {
            console.log('readFile64 ' + fileName);
            if (fs.existsSync(base + fileName)) {
                if (callback) callback(null, fs.readFileSync(base + fileName).toString('base64'));
            } else {
                if (callback) callback('Not exist', null);
            }
        });

        socket.on('writeFile64', function (_adapter, fileName, data64, callback) {
            console.log('writeFile64 ' + fileName);
            if (!fs.existsSync(base)) fs.mkdirSync(base);
            mkpathSync(base, fileName);

            try {
                var buffer = new Buffer(data64, 'base64');
                fs.writeFileSync(base + fileName, buffer);
            } catch (e) {
                console.log(JSON.stringify(e));
                if (callback) callback(e);
                return;
            }
            if (callback) callback();
        });

        socket.on('readDir', function (_adapter, dirName, callback) {
            console.log('readDir ' + dirName);
            //that.adapter.readDir(_adapter, dirName, callback);
        });

        socket.on('disconnect', function () {
            console.log('disonnect');
            //unsubscribeSocket(this, 'stateChange');
            //if (!that.infoTimeout) that.infoTimeout = setTimeout(updateConnectedInfo, 1000);
        });

        socket.on('reconnect', function () {
            console.log('reconnect');
            //subscribeSocket(this, 'stateChange');
        });

        socket.on('writeFile', function (_adapter, fileName, data, callback) {
            console.log('writeFile ' + fileName);
            if (!fs.existsSync(base)) fs.mkdirSync(base);
            mkpathSync(base, fileName);

            try {
                fs.writeFileSync(base + fileName, data);
            } catch (e) {
                console.log(JSON.stringify(e));
                if (callback) callback(e);
                return;
            }
            if (callback) callback();
        });
        socket.on('unlink', function (_adapter, name, callback) {
            console.log('unlink ' + name);
            //that.adapter.unlink(_adapter, name, callback);
        });
        socket.on('rename', function (_adapter, oldName, newName, callback) {
            console.log('rename ' + oldName);
            //that.adapter.rename(_adapter, oldName, newName, callback);
        });
        socket.on('mkdir', function (_adapter, dirname, callback) {
            console.log('mkdir ' + dirname);
            //that.adapter.mkdir(_adapter, dirname, callback);
        });
    }

    function publishAll(type, id, obj) {
        if (id === undefined) {
            console.log('Problem');
        }

        var clients = server.sockets.connected;

        for (var i in clients) {
            publish(clients[i], type, id, obj);
        }
    }

    function createServer() {
        if (server) return;
        server = io.listen(RED.server);
        server.on('connection', initSocket);
    }

	function VisNodeSet(n) {
        RED.nodes.createNode(this,n);
		var that=this;
        createServer();
		this.on("input",function(msg) {
            publishAll('stateChange', msg.topic, {val: msg.payload, ts: msg.timestamp, ack: true});
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

    RED.httpAdmin.get('/_socket/*', function(req, res, next) {
        res.set('Content-Type', 'application/javascript');
        res.send('var socketUrl = ""; var socketSession = "' + '' + '";');
    });

    RED.httpAdmin.get('/vis/*', function(req, res, next){
        var file;
        var f = req.url.split('?');

        if (f[0] == '/vis' || f[0] == '/vis/') {
            f[0] = 'index.html';
        } else {
            f[0] = f[0].substring(5);
        }
        file = __dirname + '/node_modules/iobroker.vis/www/' + f[0];

        if (fs.existsSync(file)) {
            var isBinary = false;
            var ext = file.match(/\.[^.]+$/);
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
            } else if (ext == '.ogg') {
                isBinary = true;
                _mimeType = 'audio/ogg';
            } else {
                _mimeType = 'text/javascript'
            }
            var buffer = fs.readFileSync(file);

            res.contentType(_mimeType || 'text/javascript');
            res.send(buffer);
        } else {
            res.status(404).send('404 Not found. File ' + req.url + ' not found');
        }

        return;
	});
}