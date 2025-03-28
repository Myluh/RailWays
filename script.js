addEventListener("load", event =>{
    document.querySelector(".difficulty-btn.easy").addEventListener("click", event => {
        document.querySelector(".difficulty-btn.hard").classList.remove("selected");
        event.target.classList.toggle("selected");
    })
    document.querySelector(".difficulty-btn.hard").addEventListener("click", event => {
        document.querySelector(".difficulty-btn.easy").classList.remove("selected");
        event.target.classList.toggle("selected");
    })
    document.querySelector(".description-btn").addEventListener("click", event => {
        document.querySelector("#menu").classList.add("hidden");
        document.querySelector(".description").classList.remove("hidden");
    })
    document.querySelector(".backtomenu-btn").addEventListener("click", event => {
        document.querySelector("#menu").classList.remove("hidden");
        document.querySelector(".description").classList.add("hidden");
    })
    document.querySelector(".start").addEventListener("click", startGame);
    document.addEventListener("mouseup", event => {
        isDrawing = false;
    })
    document.querySelector(".endgame").addEventListener("click", () =>{
        document.querySelector(".winscreen").classList.add("hidden");
        document.querySelector("#game").classList.add("hidden");
        document.querySelector("#menu").classList.remove("hidden");
    });
    document.querySelector(".loadgame").addEventListener("click", () =>{
        if(localStorage.getItem("saved") == null) return;
        loadGame();
    });
    document.addEventListener("mouseover", event => {
        if(event.target.tagName != "TD"){
            isDrawing = false;
        }
    })
    
})

let isDrawing = false;
let lastDir = null; // up, down, left, right
let lastX = null;
let lastY = null;
let currentX = null;
let currentY = null;
let cellMatrix = [];
let playerName = null;
let seconds = 0;
let minutes = 0;
let cycleTime = 1000;
let interval;
let difficulty;
let topListEasy = [];
let topListHard = [];

class Player{
    constructor(playerName, minutes, seconds) {
        this.playerName = playerName;
        this.minutes = minutes;
        this.seconds = seconds;
    }
}

class Cell{
    constructor(type, tdElement) {
        this.tdElement = tdElement;
        this.changeType(type);
        this.tdElement.addEventListener("mouseenter", event =>{
            if(isDrawing){
                lastX = currentX;
                lastY = currentY;
                currentX = event.target.closest('td').cellIndex;
                currentY = event.target.closest('tr').rowIndex;
                addNewRail();
                checkWin();
            }
        });
    }
    changeType(type) {
        this.tdElement.classList.remove(this.type);
        this.type = type;
        this.tdElement.classList.add(type);
    }
}

function saveGame(){
    let game = {
        player: playerName,
        minutes: minutes,
        seconds: seconds,
        map: cellMatrix  
    };
    localStorage.removeItem("saved");
    localStorage.setItem("saved", JSON.stringify(game));
    document.querySelector(".winscreen").classList.add("hidden");
    document.querySelector("#game").classList.add("hidden");
    document.querySelector("#menu").classList.remove("hidden");
}

function loadGame(){
    let game = JSON.parse(localStorage.getItem("saved"));
    seconds = game["seconds"];
    minutes = game["minutes"];
    isDrawing = false;
    lastDir = null;
    lastX = null;
    lastY = null;
    currentX = null;
    currentY = null;
    tempCellMatrix = game["map"];
    playerName = game["player"];
    let n = tempCellMatrix.length;
    if(n == 5){
        difficulty = "easy";
    }
    else if(n == 7){
        difficulty = "hard";
    }
    cellMatrix = [];
    document.querySelector(".clear-btn").addEventListener("click", clearTable);
    document.querySelector(".save-btn").addEventListener("click", saveGame);
    document.querySelector(".time").innerHTML = buildTimeText(minutes,seconds);
    document.querySelector(".playerName").innerText = playerName;
    document.querySelector("#menu").classList.add("hidden");
    const table = document.querySelector("#gameField");
    document.querySelector("#gameField > tbody").remove();
    let tbody = document.createElement('tbody');
    document.querySelector("#game").classList.remove("hidden");
    for (let row = 0; row < n; row++) {
        let tr = document.createElement('tr');
        let cellRow = [];
        for (let col = 0; col < n; col++) {
            let td = document.createElement('td');
            let cell; 
            cell = new Cell(tempCellMatrix[row][col].type, td);
            cellRow.push(cell);
            tr.appendChild(td);
        }
        cellMatrix.push(cellRow);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    table.addEventListener("mousedown", startDrawing);
    table.addEventListener("mouseup", event =>{
        lastDir = null;
    })
    startTimer();
}

function startGame(){
    if(document.querySelector(".name-input").value == ""){
        document.querySelector(".name-input").classList.add("missing");
        return;
    }
    document.querySelector(".name-input").classList.remove("missing");
    let map = null;
    let n = null;
    const random = Math.floor(Math.random() * 4);
    if(document.querySelector(".easy").classList.contains("selected")){
         const randomLevel = easyLevels[random];
         n = randomLevel["n"];
         map = randomLevel["map"];
         difficulty = "easy";
        }
        else if(document.querySelector(".hard").classList.contains("selected")){
            const randomLevel = hardLevels[random];
            n = randomLevel["n"];
            map = randomLevel["map"];
            difficulty = "hard";
    }
    else{
        document.querySelector(".difficulty-section").classList.add("missing");
        return;
    }
    document.querySelector(".clear-btn").addEventListener("click", clearTable);
    document.querySelector(".save-btn").addEventListener("click", saveGame);
    document.querySelector(".difficulty-section").classList.remove("missing");
    document.querySelector(".time").innerHTML = "00:00";
    seconds = 0;
    minutes = 0;
    isDrawing = false;
    lastDir = null;
    lastX = null;
    lastY = null;
    currentX = null;
    currentY = null;
    cellMatrix = [];
    playerName = null;
    if(localStorage.getItem("topListEasy") == null){
        topListEasy = [];
    }
    else{
        topListEasy = JSON.parse(localStorage.getItem("topListEasy"));
    }
    if (localStorage.getItem("topListHard") == null) {
        topListHard = [];
    }
    else{
        topListHard = JSON.parse(localStorage.getItem("topListHard"));
    }
    startTimer();
    playerName = document.querySelector(".name-input").value;
    document.querySelector(".playerName").innerText = playerName;
    document.querySelector("#menu").classList.add("hidden");
    const table = document.querySelector("#gameField");
    document.querySelector("#gameField > tbody").remove();
    let tbody = document.createElement('tbody');
    document.querySelector("#game").classList.remove("hidden");
    for (let row = 0; row < n; row++) {
        let tr = document.createElement('tr');
        let cellRow = [];
        for (let col = 0; col < n; col++) {
            let td = document.createElement('td');
            let cell; 
            cell = new Cell(map[row][col], td);
            cellRow.push(cell);
            tr.appendChild(td);
        }
        cellMatrix.push(cellRow);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    table.addEventListener("mousedown", startDrawing);
    table.addEventListener("mouseup", event =>{
        lastDir = null;
    })
}

function startTimer(){
    if(interval == undefined){
        interval = setInterval(tick, cycleTime);
    }
}

function tick() {
    if(seconds == 59){
        seconds = 0;
        minutes++;
    }
    else{
        seconds++;
    }
    document.querySelector(".time").innerHTML = buildTimeText(minutes,seconds);
}

function startDrawing(event){
    if(event.target.tagName != "TD"){
        isDrawing = false;
        return;
    }
    isDrawing = true;
    currentX = event.target.closest('td').cellIndex;
    currentY = event.target.closest('tr').rowIndex;
    lastX = currentX;
    lastY = currentY;
}

function addNewRail() {
    // console.log("Current: " + currentX + " " + currentY);
    // console.log("Last: " + lastX + " " + lastY);
    // console.log(lastDir);
    let cell = cellMatrix[lastY][lastX];
    switch (cell.type) {
        case "oasis":
            isDrawing = false;
            break;
        case "rail_bridge_vert":
        case "bridge_vert":
            drawBridgeVert(cell);
            break;
        case "rail_bridge_hor":
        case "bridge_hor":
            drawBridgeHor(cell);
            break;
        case "mountain_rail_upright":
        case "mountain_upright":
            drawMountainUpRight(cell);
            break;
        case "mountain_rail_upleft":
        case "mountain_upleft":
            drawMountainUpLeft(cell);
            break;
        case "mountain_rail_downleft":
        case "mountain_downleft":
            drawMountainDownLeft(cell);
            break;
        case "mountain_rail_downright":
        case "mountain_downright":
            drawMountainDownRight(cell);
            break;
        default:
            drawEmpty(cell);
            break;
    }
}

function drawMountainDownRight(cell){
    if (lastX == currentX && lastDir == "left" && lastY > currentY) {
        cell.changeType("mountain_rail_downright")
        lastDir = "up";
    }else if (lastY == currentY && lastDir == "down" && lastX < currentX) {
        cell.changeType("mountain_rail_downright")
        lastDir = "right";
    }
    else{
        isDrawing = false;
        return;
    }
}

function drawMountainDownLeft(cell){
    if (lastX == currentX && lastDir == "right" && lastY > currentY) {
        cell.changeType("mountain_rail_downleft")
        lastDir = "up";
    }else if (lastY == currentY && lastDir == "down" && lastX > currentX) {
        cell.changeType("mountain_rail_downleft")
        lastDir = "left";
    }
    else{
        isDrawing = false;
        return;
    }
}

function drawMountainUpRight(cell){
    if (lastX == currentX && lastDir == "left" && lastY < currentY) {
        cell.changeType("mountain_rail_upright")
        lastDir = "down";
    }else if (lastY == currentY && lastDir == "up" && lastX < currentX) {
        cell.changeType("mountain_rail_upright")
        lastDir = "right";
    }else{
        isDrawing = false;
        return;
    }
}

function drawMountainUpLeft(cell){
    if (lastX == currentX && lastDir == "right" && lastY < currentY) {
        cell.changeType("mountain_rail_upleft")
        lastDir = "down";
    }else if (lastY == currentY && lastDir == "up" && lastX > currentX) {
        cell.changeType("mountain_rail_upleft")
        lastDir = "left";
    }
    else{
        isDrawing = false;
        return;
    }
}

function drawBridgeHor(cell){
    if (lastY == currentY) {
        if(lastDir == "left" || lastDir == "right"){
            cell.changeType("rail_bridge_hor");
            if(lastX < currentX){
                lastDir = "right";
            }
            else{
                lastDir = "left";
            }
        }
        else{
            isDrawing = false;
            return;
        }
    }
}

function drawBridgeVert(cell){
    if (lastX == currentX) {
        if(lastDir == "up" || lastDir == "down"){
            cell.changeType("rail_bridge_vert");
            if(lastY < currentY){
                lastDir = "down";
            }
            else{
                lastDir = "up";
            }
        }
        else{
            isDrawing = false;
            return;
        }
    }
}

function drawEmpty(cell){
    if (lastX == currentX) {
        if(lastDir == "left"){
            if(lastY < currentY){
                cell.changeType("curved_rail_upright")
                lastDir = "down";
            }
            else{
                cell.changeType("curved_rail_downright")
                lastDir = "up";
            }
        }
        else if(lastDir == "right"){
            if(lastY < currentY){
                cell.changeType("curved_rail_upleft")
                lastDir = "down";
            }
            else{
                cell.changeType("curved_rail_downleft")
                lastDir = "up";
            }
        }
        else{
            cell.changeType("straight_rail_vert");
            if(lastY < currentY){
                lastDir = "down";
            }
            else{
                lastDir = "up";
            }
        }
    }else if (lastY == currentY) {
        if(lastDir == "up"){
            if(lastX < currentX){
                cell.changeType("curved_rail_upright")
                lastDir = "right";
            }
            else{
                cell.changeType("curved_rail_upleft")
                lastDir = "left";
            }
        }
        else if(lastDir == "down"){
            if(lastX < currentX){
                cell.changeType("curved_rail_downright")
                lastDir = "right";
            }
            else{
                cell.changeType("curved_rail_downleft")
                lastDir = "left";
            }
        }
        else{
            cell.changeType("straight_rail_hor");
            if(lastX < currentX){
                lastDir = "right";
            }
            else{
                lastDir = "left";
            }
        }
    }
}

function checkWin(){
    const n = cellMatrix[0].length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if(cellMatrix[i][j].type == "oasis"){
                continue;
            }
            if(cellMatrix[i][j].type.includes("rail") == false){
                return;
            }
            if(checkSides(i,j) == false){
                return;
            }
        }
    }
    isDrawing = false;
    clearInterval(interval);
    interval = undefined;
    const table = document.querySelector("#gameField");
    table.removeEventListener("mousedown", startDrawing);
    document.querySelector(".save-btn").removeEventListener("click", saveGame);
    document.querySelector(".clear-btn").removeEventListener("click", clearTable);
    const winscreen = document.querySelector(".winscreen");
    winscreen.classList.remove("hidden");
    document.querySelector(".insertPlayerName").innerHTML = playerName;
    document.querySelector(".insertTime").innerHTML = buildTimeText(minutes,seconds);
    const player = new Player(playerName, minutes, seconds);
    if(difficulty == "easy"){
        topListEasy.push(player);
        topListEasy.sort((a,b) =>{
            return (a.minutes*60 + a.seconds) - (b.minutes*60 + b.seconds);
        });
        printTopList(topListEasy);
        localStorage.removeItem("topListEasy");
        localStorage.setItem("topListEasy", JSON.stringify(topListEasy));
    }
    else if(difficulty == "hard"){
        topListHard.push(player);
        topListHard.sort((a,b) =>{
            return (a.minutes*60 + a.seconds) - (b.minutes*60 + b.seconds);
        });
        printTopList(topListHard);
        localStorage.removeItem("topListHard");
        localStorage.setItem("topListHard", JSON.stringify(topListHard));
    }
}

function printTopList(toplist){
    const toplistTable = document.querySelector(".toplist > table");
    document.querySelector(".toplist > table > tbody").remove();
    let tbody = document.createElement('tbody');
    for (let row = 0; row < toplist.length+1; row++) {
        let tr = document.createElement('tr');
        for (let col = 0; col < 3; col++) {
            let td = document.createElement('td');
            if(row != 0){
                switch (col) {
                    case 0:
                        td.innerHTML = row;
                        break;    
                    case 1:
                        td.innerHTML = toplist[row-1].playerName;
                        break;
                    case 2:
                        td.innerHTML = buildTimeText(toplist[row-1].minutes,toplist[row-1].seconds)
                        break;
                    }
                }
                else{
                    switch (col) {
                        case 0:
                            td.innerHTML = "Helyezés";
                            break;
                        case 1:
                            td.innerHTML = "Név";
                            break;
                        case 2:
                            td.innerHTML = "Idő"
                            break;
                    }
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }
    toplistTable.appendChild(tbody);
}

function checkSides(i,j){
    let isConnected = false;
    if(cellMatrix[i][j].type.includes("vert")){
        if(
            inBounds(i-1,j) &&
            cellMatrix[i-1][j].type.includes("rail") && (cellMatrix[i-1][j].type.includes("vert") || (cellMatrix[i-1][j].type.includes("up"))) &&
            inBounds(i+1,j) &&
            cellMatrix[i+1][j].type.includes("rail") && (cellMatrix[i+1][j].type.includes("vert") || (cellMatrix[i+1][j].type.includes("down")))
        ){
            isConnected = true;
        }
    }
    else if(cellMatrix[i][j].type.includes("hor")){
        if(
            inBounds(i,j-1) &&
            cellMatrix[i][j-1].type.includes("rail") && (cellMatrix[i][j-1].type.includes("hor") || (cellMatrix[i][j-1].type.includes("right"))) &&
            inBounds(i, j+1) &&
            cellMatrix[i][j+1].type.includes("rail") && (cellMatrix[i][j+1].type.includes("hor") || (cellMatrix[i][j+1].type.includes("left")))
        ){
            isConnected = true;
        }
    }
    else if(cellMatrix[i][j].type.includes("upleft")){
        if(
            inBounds(i+1,j) &&
            cellMatrix[i+1][j].type.includes("rail") && (cellMatrix[i+1][j].type.includes("vert") || (cellMatrix[i+1][j].type.includes("down"))) &&
            inBounds(i,j-1) &&
            cellMatrix[i][j-1].type.includes("rail") && (cellMatrix[i][j-1].type.includes("hor") || (cellMatrix[i][j-1].type.includes("right")))
        ){
            isConnected = true;
        }
    }
    else if(cellMatrix[i][j].type.includes("upright")){
        if(
            inBounds(i+1,j) &&
            cellMatrix[i+1][j].type.includes("rail") && (cellMatrix[i+1][j].type.includes("vert") || (cellMatrix[i+1][j].type.includes("down"))) &&
            inBounds(i,j+1) &&
            cellMatrix[i][j+1].type.includes("rail") && (cellMatrix[i][j+1].type.includes("hor") || (cellMatrix[i][j+1].type.includes("left")))
        ){
            isConnected = true;
        }
    }
    else if(cellMatrix[i][j].type.includes("downleft")){
        if(
            inBounds(i-1,j) &&
            cellMatrix[i-1][j].type.includes("rail") && (cellMatrix[i-1][j].type.includes("vert") || (cellMatrix[i-1][j].type.includes("up"))) &&
            inBounds(i,j-1) &&
            cellMatrix[i][j-1].type.includes("rail") && (cellMatrix[i][j-1].type.includes("hor") || (cellMatrix[i][j-1].type.includes("right")))
        ){
            isConnected = true;
        }
    }
    else if(cellMatrix[i][j].type.includes("downright")){
        if(
            inBounds(i-1,j) &&
            cellMatrix[i-1][j].type.includes("rail") && (cellMatrix[i-1][j].type.includes("vert") || (cellMatrix[i-1][j].type.includes("up"))) &&
            inBounds(i,j+1) &&
            cellMatrix[i][j+1].type.includes("rail") && (cellMatrix[i][j+1].type.includes("hor") || (cellMatrix[i][j+1].type.includes("left")))
        ){
            isConnected = true;
        }
    }
    return isConnected;
}

function inBounds(x, y){
    const n = cellMatrix[0].length;
    return 0 <= x && 0 <= y && x < n && y < n;
}

function buildTimeText(minutes, seconds){
    let text;
    if(minutes == 0){
        if(seconds < 10){
            text = "00:0" + seconds;
        }
        else{
            text = "00:" + seconds;
        }
    }
    else{
        if(minutes < 10){
            if(seconds < 10){
                text = "0" + minutes + ":0" + seconds;
            }
            else{
                text = "0" + minutes + ":" + seconds;
            }
        }
        else{
            if(seconds < 10){
                text = minutes + ":0" + seconds;
            }
            else{
                text = minutes + ":" + seconds;
            }
        }
    }
    return text;
}

function clearTable(){
    for (let row = 0; row < cellMatrix[0].length; row++) {
        for (let col = 0; col < cellMatrix[0].length; col++) {
            cell = cellMatrix[row][col];
            if(cell.type.includes("rail")){
                console.log(cell.type);
                switch (cell.type) {
                    case "rail_bridge_vert":
                        cell.changeType("bridge_vert");
                        break;
                    case "rail_bridge_hor":
                        cell.changeType("bridge_hor");
                        break;
                    case "mountain_rail_upright":
                        cell.changeType("mountain_upright");
                        break;
                    case "mountain_rail_upleft":
                        cell.changeType("mountain_upleft");
                        break;
                    case "mountain_rail_downright":
                        cell.changeType("mountain_downright");
                        break;
                    case "mountain_rail_downleft":
                        cell.changeType("mountain_downleft");
                        break;
                    default:
                        cell.changeType("empty");
                        break;
                }
            }
        }
    }
}

const easyLevels = [
    level1 ={
        "n" : 5,
        "map" : [
            ["empty", "mountain_upleft", "empty", "empty", "oasis"],
            ["empty", "empty", "empty", "bridge_vert", "oasis"],
            ["bridge_vert", "empty", "mountain_downleft", "empty", "empty"],
            ["empty", "empty", "empty", "oasis", "empty"],
            ["empty", "empty", "mountain_downright", "empty", "empty"]
        ]
    },
    level2 ={
        "n" : 5,
        "map" : [
            ["oasis", "empty", "bridge_hor", "empty", "empty"],
            ["empty", "mountain_downleft", "empty", "empty", "mountain_downleft"],
            ["bridge_vert", "oasis", "mountain_downright", "empty", "empty"],
            ["empty", "empty", "empty", "oasis", "empty"],
            ["empty", "empty", "empty", "empty", "empty"]
        ]
    },
    level3 ={
        "n" : 5,
        "map" : [
            ["empty", "empty", "bridge_hor", "empty", "empty"],
            ["empty", "empty", "empty", "empty", "bridge_vert"],
            ["empty", "mountain_downleft", "bridge_vert", "empty", "empty"],
            ["empty", "oasis", "empty", "empty", "empty"],
            ["empty", "bridge_hor", "empty", "empty", "mountain_downleft"]
        ]
    },
    level4 ={
        "n" : 5,
        "map" : [
            ["empty", "empty", "empty", "bridge_hor", "empty"],
            ["empty", "empty", "empty", "empty", "empty"],
            ["bridge_vert", "empty", "mountain_upleft", "empty", "mountain_upleft"],
            ["empty", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "oasis", "mountain_downright", "empty"]
        ]
    },
    level5 ={
        "n" : 5,
        "map" : [
            ["empty", "empty", "bridge_hor", "empty", "empty"],
            ["empty", "mountain_upright", "empty", "empty", "empty"],
            ["bridge_vert", "empty", "empty", "mountain_downright", "empty"],
            ["empty", "empty", "bridge_vert", "oasis", "empty"],
            ["empty", "mountain_downleft", "empty", "empty", "empty"]
        ]
    }
]
const hardLevels = [
    level1 ={
        "n" : 7,
        "map" : [
            ["empty", "mountain_upleft", "oasis", "oasis", "empty", "bridge_hor", "empty"],
            ["bridge_vert", "empty", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "bridge_vert", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "empty", "mountain_downright", "empty", "empty", "empty"],
            ["mountain_downright", "empty", "mountain_upleft", "empty", "bridge_hor", "empty", "oasis"],
            ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "empty", "bridge_hor", "empty", "empty", "empty"]
        ]
    },
    level2 ={
        "n" : 7,
        "map" : [
            ["empty", "empty", "oasis", "empty", "empty", "empty", "empty"],
            ["bridge_vert", "empty", "bridge_hor", "empty", "empty", "mountain_downleft", "empty"],
            ["empty", "empty", "bridge_hor", "empty", "empty", "empty", "bridge_vert"],
            ["mountain_upright", "empty", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "oasis", "empty", "mountain_upleft", "empty", "empty", "empty"],
            ["empty", "mountain_upright", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "oasis", "empty", "empty", "empty", "empty"]
        ]
    },
    level3 ={
        "n" : 7,
        "map" : [
            ["empty", "empty", "bridge_hor", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "empty", "empty", "empty", "empty", "bridge_vert"],
            ["oasis", "empty", "mountain_downright", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "oasis", "mountain_downright", "empty", "bridge_hor", "empty", "empty"],
            ["bridge_vert", "empty", "empty", "empty", "empty", "mountain_upleft", "empty"],
            ["empty", "empty", "oasis", "mountain_downright", "empty", "empty", "empty"]
        ]
    },
    level4 ={
        "n" : 7,
        "map" : [
            ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "empty", "bridge_vert", "empty", "mountain_downleft", "empty"],
            ["empty", "empty", "mountain_downright", "empty", "empty", "empty", "empty"],
            ["empty", "bridge_hor", "empty", "oasis", "empty", "bridge_hor", "empty"],
            ["empty", "empty", "mountain_downleft", "empty", "mountain_upleft", "empty", "empty"],
            ["bridge_vert", "empty", "empty", "empty", "empty", "mountain_downright", "empty"],
            ["empty", "empty", "empty", "empty", "empty", "empty", "empty"]
        ]
    },
    level5 ={
        "n" : 7,
        "map" : [
            ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "empty", "empty", "empty", "mountain_upright", "empty"],
            ["empty", "bridge_hor", "bridge_hor", "empty", "mountain_upleft", "empty", "empty"],
            ["empty", "empty", "empty", "empty", "empty", "empty", "empty"],
            ["empty", "empty", "mountain_upright", "empty", "oasis", "empty", "empty"],
            ["empty", "mountain_downleft", "empty", "bridge_vert", "empty", "empty", "empty"],
            ["empty", "empty", "empty", "empty", "empty", "empty", "empty"]
        ]
    }
]