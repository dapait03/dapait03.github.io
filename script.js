document.addEventListener("DOMContentLoaded", function(){
    alert("Ziel des Spiels: \n Versuche so viele Powerups (grün) wie möglich einzusammeln. \n Steuerung: \n Swipe in eine Richtung, um die Schlange (pink) zu bewegen. \n Drücke auf den Bildschirm, um das Powerup neu erscheinen zu lassen. \n Benutze 2 Finger, um das Spiel neuzustarten.");
    init();
    requestAnimationFrame(gameLoop);
}, false)

/*
-------------------------------------------------
    Canvas
-------------------------------------------------
*/

var canvas = document.getElementById("canvas01");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var canvasContext = this.canvas.getContext("2d");

// Sounds
var pickupSound = new Audio("./music/pickupSound.wav");
var gameOver = new Audio("./music/gameOver.wav");

/*
-------------------------------------------------
    Variables
-------------------------------------------------
*/

// System variables
var grid = 16, level = 4, attempt = 0, count = 0, highscore = 0, powerups = 0, score = 0;

// var header = document.getElementById("h4");
var header = [];
header[0] = document.getElementById("score");
header[1] = document.getElementById("highscore");
header[2] = document.getElementById("powerups");
header[3] = document.getElementById("attempt");

// player
var snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    // Starting cells
    maxCells: 4,
};

// power up spawn area
var powerup = {
    x: getRandomInt(0, (canvas.width/25)) * grid,
    y: getRandomInt(0, (canvas.height/25)) * grid,
};

// touch variables
var pageWidth = window.innerWidth || document.body.clientWidth;
var threshold = Math.max(1, Math.floor(.01 * (pageWidth)));
var touchStartX = 0, touchStartY = 0, touchEndX = 0, touchEndY = 0;
const LIMIT = Math.tan(45 * 1.5 / 180 * Math.PI);

/*
-------------------------------------------------
    Game Loop
-------------------------------------------------
*/
function gameLoop(){

    document.getElementById("backgroundAudio").volume = .1;
    document.getElementById("backgroundAudio").muted = false;

    requestAnimationFrame(gameLoop);
    if (++count < level ) {
        return;
    }

    count = 0;
    canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (fingersPresent < 2) {
    snake.x += snake.dx;
    snake.y += snake.dy;
    } else {
        snake.x += 0;
        snake.y += 0;
    }

    // Snake Movement
    // unshift adds snake coordinates to the beginning
    // and pops the last element if maxCells < length
    snake.cells.unshift({x: snake.x, y: snake.y});
    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // Power Up color
    canvasContext.fillStyle = "green";
    // Power Up drawing
    canvasContext.fillRect(powerup.x, powerup.y, grid-1, grid-1);

    // Snake color
    canvasContext.fillStyle = "#b00b69";
    // Snake drawing for each element in cells
    snake.cells.forEach(function(cell, index){

        canvasContext.fillRect(cell.x, cell.y, grid-1, grid-1);
        
        // Adds cell, if snake x,y === powerup x,y
        if (cell.x === powerup.x && cell.y === powerup.y){
            snake.maxCells++;
            score += (5 + powerups);
            level += .01;
            powerups++;
            
            // play sound
            pickupSound.play();

            // add power up at random coordinates
            powerup.x = getRandomInt(0, (canvas.width/25)) * grid;
            powerup.y = getRandomInt(0, (canvas.height/25)) * grid;

            // displaying score mid game
            header[0].innerHTML=("Score: " + score);
            header[2].innerHTML=("PowerUps: " + powerups);
        }

        // if snake outside of borders -> reset, init
        for(var i = index + 1; i < snake.cells.length; i++) {
            if (snake.x < 0 || snake.x >= canvas.width || snake.y < 0 || snake.y >= canvas.height || cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                gameOver.play();
                reset();
                init();
            }
        }
    });
}

/*
-------------------------------------------------
    Game Loop - Functions
-------------------------------------------------
*/

// Random coordinates mainly for power ups
function getRandomInt(min, max){

    return Math.floor(Math.random() * (max-min)) + min;

}

// init function for reseting purposes
function init(){

    let temp = canvasContext.getImageData(0, 0, canvas.width, canvas.height)
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 100;
    canvasContext.putImageData(temp, 0, 0,);

}

// Reseting environment for new game of snake
function reset(){

    document.getElementById("backgroundAudio").muted = false;
    snake.x = 160;
    snake.y = 160;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    powerup.x = getRandomInt(0, (canvas.width/25)) * grid;
    powerup.y = getRandomInt(0, (canvas.height/25)) * grid;

    // determination of highscore
    if (score >= highscore || highscore == ""){
        highscore = score;
    }
    
    attempt++;
    score = 0;
    level = 4;
    powerups = 0;

    header[0].innerHTML=("Score: " + score);
    header[1].innerHTML=("Highscore: " + highscore);
    header[2].innerHTML=("PowerUps: " + powerups);
    header[3].innerHTML=("Versuch: " + attempt);
}

/*
-------------------------------------------------
    Touch Events - Listener, Handler
-------------------------------------------------
*/

canvas.addEventListener("touchstart", function(event){
    
    event.preventDefault();

    touchStartX = event.changedTouches[0].screenX;
    touchStartY = event.changedTouches[0].screenY;
    
}, false);

canvas.addEventListener("touchmove", function(event){
    var tempSnake = {
        dx: snake.dx,
        dy: snake.dy,
    }
    var tempPowerup = {
        x: powerup.x,
        y: powerup.y
    }

    if(event.touches.length >= 2){
        snake.dx = snake.dy = 0;
    } else {
        snake.dx = tempSnake.dx;
        snake.dy = tempSnake.dy;
        powerup.x = tempPowerup.x;
        powerup.y = tempPowerup.y;
    }

}, false)

canvas.addEventListener("touchend", function(event){

    event.preventDefault();

    touchEndX = event.changedTouches[0].screenX;
    touchEndY = event.changedTouches[0].screenY;

    directionHandler(event);

}, false);

function directionHandler(event) {

    var x = touchEndX - touchStartX;
    var y = touchEndY - touchStartY;
    var xy = Math.abs(x/y);
    var yx = Math.abs(y/x);

    if (Math.abs(x) > threshold || Math.abs(y) > threshold || snake.dx === 0){

        if (yx <= LIMIT){
            if(x < 0){
                if (snake.dx === 0){
                    snake.dx = -grid;
                    snake.dy = 0;
                }
            } else {
                if (snake.dx === 0){
                    snake.dx = grid;
                    snake.dy = 0;
                }
            }
        }
        if (xy <= LIMIT){
            if (y < 0) {
                // direction: up
                if(snake.dy === 0){
                    snake.dy = -grid;
                    snake.dx = 0;
                } 
            } else {
                // direction: down
                if (snake.dy === 0){
                    snake.dy = grid;
                    snake.dx = 0;
                }
            }
        }
    } else {
        // tap
        powerup.x = getRandomInt(0, (canvas.width/25)) * grid;
        powerup.y = getRandomInt(0, (canvas.height/25)) * grid;
    }
}
