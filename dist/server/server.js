'use strict';

var _util = require('../shared/util');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var users = [];
var sockets = {};

app.use(_express2.default['static'](__dirname + '/../client'));

io.on('connection', function (socket) {
    var name = socket.handshake.query.name;

    var currentUser = {
        id: socket.id,
        name: name
    };

    if ((0, _util.findIndex)(users, currentUser.id) > -1) {
        console.log('[INFO] User ID is already connected, kicking.');
        socket.disconnect();
    } else if (!(0, _util.validNick)(currentUser.name)) {
        socket.disconnect();
    } else {
        console.log('[INFO] User ' + currentUser.name + ' connected!');
        sockets[currentUser.id] = socket;
        users.push(currentUser);

        io.emit('userJoin', { name: currentUser.name });

        console.log('[INFO] Total users: ' + users.length);
    }

    socket.on('ding', function () {
        socket.emit('dong');
    });

    socket.on('disconnect', function () {
        if ((0, _util.findIndex)(users, currentUser.id) > -1) users.splice((0, _util.findIndex)(users, currentUser.id), 1);
        console.log('[INFO] User ' + currentUser.name + ' disconnected!');

        socket.broadcast.emit('userDisconnect', { name: currentUser.name });
    });

    socket.on('userChat', function (data) {
        var _sender = (0, _util.sanitizeString)(data.sender);
        var _message = (0, _util.sanitizeString)(data.message);
        var date = new Date();
        var time = ("0" + date.getHours()).slice(-2) + ("0" + date.getMinutes()).slice(-2);

        console.log('[CHAT] [' + time + '] ' + _sender + ': ' + _message);
        socket.broadcast.emit('serverSendUserChat', { sender: _sender, message: _message });
    });
});

http.listen(port, function () {
    console.log('[INFO] Listening on *:' + port);
});