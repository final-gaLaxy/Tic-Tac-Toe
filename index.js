// Setup basic express server
var express = require("express");
var app = express();
var path = require("path");
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 8080;

// Initialise variables for future use
var rooms = {};
let lobbies = [];

// Listen to port 8080 or local variable's designated port
server.listen(port, () => {
    console.log("Server listening at port %d", port);
});

// Routing

app.use(express.static(path.join(__dirname, "public")));

// Socket Connections

io.on("connection", socket => {
    var addedUser = false;
    socket.on("add user", username => {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        addedUser = true;
        io.to(socket.id).emit("new lobby", {
            lobbies: rooms
        })
    });

    socket.on("join lobby", data => {

        if (Object.keys(rooms).includes(data.lobbyId)) {

            // join socket user to lobbyId through sockets .join() method
            socket.join(`${data.lobbyId}`);

            socket.lobby = `${data.lobbyId}`;
            // Emit "user joined" to all sockets in local room (data.lobbyID)
            socket.to(`${data.lobbyId}`).emit("user joined", {
                username: socket.username
            });
            rooms[data.lobbyId].users.push(`${socket.username}`);
            if (rooms[data.lobbyId].playerO !== "") {
                if (rooms[data.lobbyId].playerX == "") {
                    rooms[data.lobbyId].playerX = socket.username;
                }
            } else {
                rooms[data.lobbyId].playing = `O`;
                rooms[data.lobbyId].playerO = socket.username;
            }
            console.log(Object.keys(io.sockets.clients()))
            Object.keys(io.sockets.clients()).forEach(session => {
                //console.log(session);
            });
        } else {

            /*
                Format Object as:
                {
                    lobbyId: {
                        users: [], // Contains users in current room using socket.username
                        playerO: "", // Stores playerO's username using socket.username
                        playerX: "" //Stores playerX's username using socket.username
                    }
                }
            */
            rooms[data.lobbyId] = {
                users: [],
                playerO: "",
                playerX: "",
                playing: ""
            };

            // Add socket user to users array for lobbyId
            rooms[data.lobbyId].users.push(`${socket.username}`);
            rooms[data.lobbyId].playerO = `${socket.username}`;
            rooms[data.lobbyId].playing = `O`;


            // Assign lobbyId to socket user
            socket.lobby = `${data.lobbyId}`;

            // join socket user to lobbyId through sockets .join() method
            socket.join(`${data.lobbyId}`);

            // Emit to all users a new lobby is available for joining
            Object.keys(io.sockets.clients().connected).forEach(session => {
                if (!("lobby" in io.sockets.clients().connected[session])) {} else {
                    if (!lobbies.includes(io.sockets.clients().connected[session].lobby)) lobbies.push(io.sockets.clients().connected[session].lobby);
                }
            });
            io.emit("new lobby", { lobbies: rooms });
        }

        // Emit "login" to current socket to register they have entered the lobby
        io.to(socket.id).emit("login", {
            lobby: data.lobbyId,
            playing: rooms[data.lobbyId].playing,
            playerX: rooms[data.lobbyId].playerX,
            playerO: rooms[data.lobbyId].playerO
        });
    });

    socket.on("move", (data) => {
        console.log(socket.lobby);

        console.log(`Current Users: %s\n Player O: %s\n Player X: %s`, rooms[socket.lobby].users, rooms[socket.lobby].playerO, rooms[socket.lobby].playerX); //.player${data.player.toString().toUpperCase()}
        socket.to(socket.lobby).emit('move', {
            board: data.board,
            player: data.player,
            playing: eval(`rooms.${socket.lobby}.player${data.player.toString().toUpperCase()}`)
        });
    });

    socket.on("disconnect", () => {
        if (!socket.lobby) return;
        console.log("test")
        var index = rooms[socket.lobby].users.indexOf(socket.username);
        if (index !== -1) rooms[socket.lobby].users.splice(index, 1);
        if (rooms[socket.lobby].playerX == socket.username) return rooms[socket.lobby].playerX = "";
        if (rooms[socket.lobby].playerO == socket.username) return rooms[socket.lobby].playerO = "";
    });
});