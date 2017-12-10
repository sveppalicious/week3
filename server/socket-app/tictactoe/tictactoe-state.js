const _ = require('lodash');

module.exports = function (injected) {

    return function (history) {
        let gridSize = 3;
        let gameFull = false;
        let gameStarted = false;
        let gameGrid = [['', '', ''], ['', '', ''], ['', '', '']];
        let gameScore = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        let moveCount = 0;
        let nextMove = 'X';

        function processEvent(event) {
            if (event.type === "GameJoined") {
                gameFull = true;
                gameStarted = true;
            }
            if (event.type === "MovePlaced") {
                let point = event.move.side === 'X' ? 1 : -1;
                let row = event.move.xy.y;
                let col = event.move.xy.x;

                gameScore[row] += point; // where point is either +1 or -1

                gameScore[gridSize + col] += point;

                if (row === col) gameScore[2 * gridSize] += point;

                if (gridSize - 1 - col === row) gameScore[2 * gridSize + 1] += point;

                moveCount++;
                nextMove = (event.move.side==='X'?'O':'X');

                gameGrid[event.move.xy.x][event.move.xy.y] = event.move.side;
            }
        }

        function gameWon() {

            return _.reduce(gameScore, function (won, score) {
                return won || score === 3 || score === -3;

            }, false);
        }

        function processEvents(history) {
            _.each(history, processEvent);
        }

        processEvents(history);

        return {
            processEvents: processEvents,
            gameStarted: function(){
                return gameStarted;
            },
            gameFull: function () {
                return gameFull;
            },
            isMyMove:function(side){
                return side===nextMove;
            },
            gameWon: gameWon,
            gameDraw: function () {
                if (gameWon()) return false;
                return moveCount === gridSize * gridSize;
            },
            occupied: function (coords) {
                return !!gameGrid[coords.x][coords.y];
            }
        }
    };
};
