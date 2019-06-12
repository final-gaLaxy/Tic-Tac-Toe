var socket = io();

$(function() {

    var $window = $(window);
    var $usernameInput = $('.usernameInput'); // Input for username
    var $lobbyInput = $('.lobbyInput'); // Input for lobby
    var $messages = $('.messages'); // Messages area
    var $inputMessage = $('.inputMessage'); // Input message input box
    var $lobbyBrowse = $('.game.btn');
    var $lobbyArea = $('.lobbies');

    var $loginPage = $('.login.page'); // The login page
    var $lobbyPage = $('.lobby.page'); // The lobby page
    var $lobbylistPage = $('.lobby-list.page');
    var $gamePage = $('.game.page'); // The chatroom page

    var username;
    var connected = false;
    var typing = false;
    var lastTypingTime;
    var $currentInput = $usernameInput.focus();

    var lobby;
    var lobbies = [];
    var searchTimer;

    const setUsername = () => {
        username = cleanInput($usernameInput.val().trim());

        // If the username is valid
        if (username) {
            $loginPage.fadeOut();
            $lobbyPage.show();
            $loginPage.off('click');
            $currentInput = $lobbyInput.focus();

            // Tell the server your username
            socket.emit('add user', username);
        }
    }

    const setLobby = () => {
        lobby = cleanInput($lobbyInput.val().trim());

        // If the lobby is valid
        if (lobby) {
            $lobbyPage.fadeOut();
            $gamePage.show();
            $lobbyPage.off('click');
            $currentInput = $inputMessage.focus();

            // Tell the server your lobby and username
            socket.emit('join lobby', { username: username, lobbyId: lobby });
        }
    }

    const browseLobby = () => {
        $lobbyPage.fadeOut();
        $lobbylistPage.show();
        $lobbyPage.off('click');
        searching = true;
    }

    const log = (message, options) => {
        var $el = $('<li>').addClass('log').text(message);
        addMessageElement($el, options);
        setTimeout(() => {
            $($el).animate({ opacity: 0 })
        }, 5000);
    }

    const addMessageElement = (el, options) => {
        if ($messages.children().length !== 0) $($messages[0]).empty();
        var $el = $(el);

        // Setup default options
        if (!options) {
            options = {};
        }
        if (typeof options.fade === 'undefined') {
            options.fade = true;
        }
        if (typeof options.prepend === 'undefined') {
            options.prepend = false;
        }

        // Apply options
        if (options.fade) {
            $el.hide().fadeIn(150);
        }
        if (options.prepend) {
            $messages.prepend($el);
        } else {
            $messages.append($el);
        }
        $messages[0].scrollTop = $messages[0].scrollHeight;
    }

    const addLobbies = (el) => {
        if ($lobbylistPage.children().length !== 0) $($messages[0]).empty();
        lobbies.forEach(element => {
            var $el = $('<li>').addClass('lobbyId').text(element);
            $lobbyArea.append(el);
        });
    }

    $window.keydown(event => {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
            $currentInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if (username) {
                if (lobby) {
                    sendMessage();
                } else {
                    setLobby();
                }
            } else {
                setUsername();
            }
        }
    });

    $lobbyInput.change(() => {
        if ($lobbyInput.val() == "") {
            $lobbyInput.css("background-image", "none");
        } else {

        }
    });

    $lobbyInput.on('input', () => {
        updateTyping();
    });

    $lobbyBrowse.on('click', () => {
        browseLobby();
    })

    const updateTyping = () => {
        if (username) {
            if (!typing) {
                typing = true;
                $lobbyInput.css("background-image", "url('/src/images/loader.gif')");
            }
            lastTypingTime = (new Date()).getTime();

            setTimeout(() => {
                var typingTimer = (new Date()).getTime();
                var timeDiff = typingTimer - lastTypingTime;
                if (timeDiff >= 400 && typing) {
                    // TODO: create an event to check if lobby is valid (alphanumeric, numbers and special characters only)
                    $lobbyInput.css("background-image", "none");
                    typing = false;
                }
            }, 400);
        }
    }

    const cleanInput = (input) => {
        return $('<div/>').text(input).html();
    }

    socket.on('login', (data) => {
        connected = true;
        // Display the welcome message
        var message = "You joined Game: " + data.lobby;
        player = data.playing;
        log(message, {
            prepend: true
        });

        //addParticipantsMessage(data);
    });

    socket.on('user joined', (data) => {
        log(data.username + ' joined');
    });

    socket.on('new lobby', (data) => {
        lobbies = data.lobbies;
        addLobbies();
    });



    //   _______   _____    _____         _______               _____         _______    ____    ______
    //  |__   __| |_   _|  / ____|       |__   __|     /\      / ____|       |__   __|  / __ \  |  ____|
    //     | |      | |   | |               | |       /  \    | |               | |    | |  | | | |__
    //     | |      | |   | |               | |      / /\ \   | |               | |    | |  | | |  __|
    //     | |     _| |_  | |____           | |     / ____ \  | |____           | |    | |__| | | |____
    //     |_|    |_____|  \_____|          |_|    /_/    \_\  \_____|          |_|     \____/  |______|

    // Initialise Tic Tac Toe Variables

    // Player variable states the player that is currently playing
    var player = "O";

    // Board varible states the current board and the cell's occupants (X or O)
    var board = [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
    ];

    // Used when restarting game
    var previousText;
    var interval;
    var restartTimer = 5;
    var isDone = true;

    // Win Count
    var xWins = 0;
    var oWins = 0;

    var canMove = true;

    // When cell of Tic Tac Toe bored is clicked start move
    $("th > div").click(function() {

        // Checks if cell is empty and can move
        if ($(this).html() == "" && isDone && canMove) {
            // Sets cell to current player
            $(this).html(player);

            // Records cell to board
            var row = Number($(this).attr("id").split("")[0]);
            var column = Number($(this).attr("id").split("")[1]);

            board[row][column] = player;
            // Switches to reverse Player
            if (player == "O") {
                player = "X"
            } else {
                player = "O";
            }
            socket.emit('move', { board: board, player: player });
            canMove = false;
            if (checkWin()) {
                return;
            }

            // Sets visual display of player to current player
            $("#player").html("Playing Now: " + player);
        } else {
            // This runs if the clicked cell is already occupied
            return;
        }
    });

    function checkWin() {
        // Check solutions stated in solutions.txt
        // Start with the player who owns the middle cell

        if (board[1][1] == "") {
            var tester = "O";
        } else var tester = board[1][1];

        // Solutions Set 1

        if (board[0][0] == tester & board[1][1] == tester & board[2][2] == tester) {
            $(".game-info").html(tester + " won!");

            gameReset(tester);
            return;
        } else if (board[0][2] == tester & board[1][1] == tester & board[2][0] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[0][0] == tester & board[1][0] == tester & board[2][0] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[0][1] == tester & board[1][1] == tester & board[2][1] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[0][2] == tester & board[1][2] == tester & board[2][2] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[0][0] == tester & board[0][1] == tester & board[0][2] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[1][0] == tester & board[1][1] == tester & board[1][2] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[2][0] == tester & board[2][1] == tester & board[2][2] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        }


        if (tester == "O") tester = "X";
        else tester = "O";

        // Solutions Set 1
        if (board[0][0] == tester & board[1][0] == tester & board[2][0] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[0][2] == tester & board[1][2] == tester & board[2][2] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[0][0] == tester & board[0][1] == tester & board[0][2] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        } else if (board[2][0] == tester & board[2][1] == tester & board[2][2] == tester) {
            $(".game-info").html(tester + " won!");
            gameReset(tester);
            return;
        }

        // Check for stalemate
        var complete = false;
        board.forEach(function(element, index) {
            if (complete) return;
            board[index].forEach(function(el, index2) {
                if (el == "") return complete = true;
                if (index == 2 & index2 == 2 & !complete) {
                    $(".game-info").html("Stalemate nobody won!");
                    gameReset(null);
                    return;
                }
            });
        });

        return false;
    }

    function gameReset(tester) {
        isDone = false;
        if (tester != null) updateScore(tester);
        restartTimer = 5;
        previousText = $(".game-info").html();
        $(".game-info").html(previousText + "<br>Restarting in ... " + restartTimer);
        interval = setInterval(function() {
            restartTimer--;
            $(".game-info").html(previousText + "<br>Restarting in ... " + restartTimer);
            if (restartTimer == 0) {
                $(".game-info").html("");
                clearInterval(interval);
            }
        }, 1000);
        setTimeout(function() {
            var cells = $("table").find("div");
            for (var i = 0; i < cells.length; i++) {
                $(cells[i]).html("");
            }
            board.forEach(function(value, index) {
                board[index].forEach(function(value2, index2) {
                    board[index][index2] = "";
                });
            });
            isDone = true;
        }, 5000)
    }

    function updateScore(winner) {
        eval(winner.toLowerCase() + 'Wins++');
        el = $(".game-count").html("X: " + xWins + ",<br>O: " + oWins);
    }

    socket.on('move', (data) => {
        board = data.board;
        player = data.player;
        // Sets visual display of player to current player
        $("#player").html("Playing Now: " + player);
        board.forEach(function(value, index) {
            board[index].forEach(function(value2, index2) {
                $(`table #${index}${index2}`).text(board[index][index2]);
            });
        });
        if (username = data.playing) canMove = true;
        console.log(data.playing);
        checkWin();
    });
});