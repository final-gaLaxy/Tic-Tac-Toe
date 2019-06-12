$(function() {
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

    var canMove;

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
            socket.emit('move', { board: board, player: player })
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
        board.forEach(function(value, index) {
            board[index].forEach(function(value2, index2) {
                $(`table #${index}${index2}`)[0].html(board[index][index2]);
            });
        });
        canMove = true;
        checkWin();
    });
});