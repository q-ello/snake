function randomCell(max) {
    let x = Math.floor(Math.random()*max);
    let y = Math.floor(Math.random()*max);
    if (cells[y * 10 + x].classList.contains("snake")) return randomCell(max);
    else return [x, y];
}

const field = document.querySelector(".field");
const theRecord = document.querySelector(".theRecord");
const restart = document.querySelector(".restart");
const scoreDisplay = document.querySelector(".score");
const overlay = document.createElement("div");
overlay.classList.add("overlay");

class Snake {
    constructor(body) {
        this.body = body;
        this.addLater = [];
        this._speed = 500;
    }

    draw() {
        let headcheck = true;
        this.body.forEach(cell => {
            if (headcheck === true) cells[cell[1] * 10 + cell[0]].classList.add("snakeHead");
            cells[cell[1] * 10 + cell[0]].classList.add("snake");
            headcheck = false;
        });
    }

    move(direction){

        const tail = this.body.pop();

        const oldHead = this.body[0];
        cells[oldHead[1] * 10 + oldHead[0]].classList.remove("snakeHead");

        if (tail === this.addLater[0]) {
            this.addLater.shift();
            this.grow(tail);
        } else cells[tail[1] * 10 + tail[0]].classList.remove("snake");

        let newHead;
        if (direction === 1 || direction === -1) {
            newHead = [oldHead[0] + direction, oldHead[1]];
            if (newHead[0] === 10 || newHead[0] === -1) return false;
        }
        else {
            newHead = [oldHead[0], oldHead[1] + direction/10];
            if (newHead[1] === 10 || newHead[1] === -1) return false;
        }

        if (this.checkBump(newHead)){
            return false;
        }

        this.body.unshift(newHead);
        cells[newHead[1]*10 + newHead[0]].classList.add("snakeHead", "snake");


        if (this.checkApple(newHead)){
            this.addLater.push(newHead);
            return true;
        }


        return newHead;
    }

    accelerate(){
        this._speed -= 10;
    }

    checkApple(cell){
        return (cells[cell[1] * 10 + cell[0]].classList.contains("apple"));
    }

    checkBump(cell){
        return (cells[cell[1] * 10 + cell[0]].classList.contains("snake"));
    }

    grow(tail) {
        this.body.push(tail);
    }

    reset(){
        let checkhead = true;
        this.body.forEach(cell => {
            if (checkhead) cells[cell[1] * 10 + cell[0]].classList.remove("snakeHead");
            checkhead = false;
            cells[cell[1] * 10 + cell[0]].classList.remove("snake");
        });
        this.body = [[5, 4], [4, 4]];
        this._speed = 500;
    }
}

class Apple{
    constructor(cell){
        this.x = cell[0];
        this.y = cell[1];
    }

    draw() {
        cells[this.y * 10 + this.x].classList.add("apple");
    }

    destroy() {
        cells[this.y * 10 + this.x].classList.remove("apple");
    }
}

class Score {
    constructor(score){
        this._score = score;
    }

    draw() {
        scoreDisplay.innerText = `Your score is: ${this._score}`;
    }

    increase() {
        this._score++;
    }

    reset(){
        this._score = 0;
    }

}

class Game {
    constructor(){
        this.snake = new Snake([[5, 4], [4, 4]]);
        this.apple = new Apple(randomCell(10));
        this.score = new Score(0);
        this.direction = 1;
    }

    createBoard(){
        this.snake.draw();
        this.score.draw();
        this.apple.draw();
    }
    play() {
        
        let interval = setInterval(() => {
            let newHead = this.snake.move(this.direction);

            if (newHead === true){
                this.snakeEatedApple(interval);
            }
            
            if (this.score._score === 98) {
                this.win();
                this.end(interval);
            }
            
            if (newHead === false){
                this.lose();
                this.end(interval);
            }

        }, this.snake._speed);

        document.addEventListener('keyup', (event) => {
            if (event.code === "ArrowLeft" && this.direction !== 1) this.direction = -1;
            if (event.code === "ArrowUp" && this.direction !== 10) this.direction = -10;
            if (event.code === "ArrowRight" && this.direction !== -1) this.direction = 1;
            if (event.code === "ArrowDown" && this.direction !== -10) this.direction = 10;
        });
    }

    snakeEatedApple(interval){
        this.apple.destroy();
        this.apple = new Apple(randomCell(10));
        this.score.increase();
        this.apple.draw();
        this.score.draw();
        this.snake.accelerate();
        clearInterval(interval);
        this.play();
    }

    lose() {
        overlay.innerText = `You died.`;
    }

    win(){
        overlay.innerText = "Congratulations, you won!";
    }

    end(interval){
        clearInterval(interval);
        let record = localStorage.getItem("record");
        if (record === null || this.score._score > record) localStorage.setItem("record", this.score._score);
        theRecord.innerText = `Your best score is: ${localStorage.getItem("record")}`;
        theRecord.style.display = "block";
        overlay.innerText += ` \n Your score is: ${this.score._score}. \n Your best score is: ${localStorage.getItem("record")}`;
        overlay.style.display = "flex";

        restart.style.display = "flex";
    }

    reset(){
        this.snake.reset();
        this.apple.destroy();
        this.apple = new Apple(randomCell(10));
        this.score.reset();
        this.direction = 1;
    }
}


let cellsString = ``;
for (let i = 0; i < 100; i++){
    cellsString += `<div class="cell"></div>`;
}

field.innerHTML = cellsString;

field.appendChild(overlay);

overlay.innerText += "Click to start playing";

let cells = document.querySelectorAll('.cell');

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("record")){
        theRecord.style.display = "block";
        theRecord.innerText = `Your best score is: ${localStorage.getItem("record")}`;
    }

    let game = new Game;
    game.createBoard();
    field.addEventListener('click', () => {
        overlay.style.display = "none";
        game.play();
    }, {once: true});

    restart.addEventListener('click', () => {
        overlay.style.display = "none";
        restart.style.display = "none";
        game.reset();
        game.createBoard();
        game.play();
    })
});

