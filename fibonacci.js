
const size = 50;
const sequenceNumber = 5;
const checkTypeEnum = { ToLeft: 1, ToRight: 2, ToBottom: 3, ToUp: 4, All: -1 };
const checkType = checkTypeEnum.All;

var map = [];
var lastMap = [];

function render() {
    console.log('rendering');
    for (var r = 0; r < map.length; r++) {
        for (var c = 0; c < map[r].length; c++) {
            let cell = map[r][c];

            if (cell.element.dataset.toclean == "true") {
                cleanCell(cell);
            }
            cell.element.innerText = cell.value;
        }
    }
    window.innerHeight;
}

function generate() {
    let container = document.getElementById('container');
    container.innerHTML = '';

    for (var r = 0; r < size; r++) {
        map[r] = [];
        for (var c = 0; c < size; c++) {
            let t = document.createElement('div');
            t.setAttribute('data-row', r);
            t.setAttribute('data-column', c);
            t.onclick = raise;
            map[r][c] = { element: t, value: null };
            container.appendChild(map[r][c].element);
        }
    }
    render();
}

function raise(sender) {
    //console.log('raised by:', sender.target.dataset.row, sender.target.dataset.column);
    let r = Number(sender.target.dataset.row);
    let c = Number(sender.target.dataset.column);

    for (var ri = 0; ri < map.length; ri++) {
        map[ri][c].value++;

        let isFibo = isFibonacci(map[ri][c].value);

        map[ri][c].element.setAttribute('data-isfibo', isFibo);
        map[ri][c].element.setAttribute('data-pos', (isFibo ? positionAtFibonacci(map[ri][c].value) : null));

        colorFlash(map[ri][c].element, false);
    }
    for (var ci = 0; ci < map[r].length; ci++) {
        if (ci !== c) {

            map[r][ci].value++;

            let isFibo = isFibonacci(map[r][ci].value);
            map[r][ci].element.setAttribute('data-isfibo', isFibo);
            map[r][ci].element.setAttribute('data-pos', (isFibo ? positionAtFibonacci(map[r][ci].value) : null));

            colorFlash(map[r][ci].element, false);
        }
    }
    sequenceChecker(sender);
}

function sequenceChecker(sender) {

    if (checkType == checkTypeEnum.All || checkType == checkTypeEnum.ToRight) {
        rowOrColumnCheck(checkTypeEnum.ToRight, false);
    }
    if (checkType == checkTypeEnum.All || checkType == checkTypeEnum.ToLeft) {
        rowOrColumnCheck(checkTypeEnum.ToLeft, false);
    }
    if (checkType == checkTypeEnum.All || checkType == checkTypeEnum.ToBottom) {
        rowOrColumnCheck(checkTypeEnum.ToBottom, true);
    }
    if (checkType == checkTypeEnum.All || checkType == checkTypeEnum.ToUp) {
        rowOrColumnCheck(checkTypeEnum.ToUp, true);
    }

    render();
}

//checking the numbers next to each others horizontally 
function rowOrColumnCheck(checkType, isVertical) {

    //defaults are for ToRight and ToBottom
    let from = 0, to = size, increment = 1;

    //ToLeft or ToUp is a backward checking
    if (checkType == checkTypeEnum.ToLeft || checkType == checkTypeEnum.ToUp) {
        from = size;
        to = 0;
        increment = -1;
    }


    for (var r = 0; r < size; r++) {
        let checkContext = {
            counter: 0,
            fiboSqeuence: [],
            gotFirst: false //flag if we had the first element (the first #1);
        }
        if (checkType == checkTypeEnum.ToLeft || checkType == checkTypeEnum.ToUp) {

            for (var c = size-1; c > 0; c--) {
                if (isVertical) {
                    checkerCoreLogic(c, r, checkContext, checkType);
                } else {
                    checkerCoreLogic(r, c, checkContext, checkType);
                }
            }
        } else {
            for (var c = 0; c < size; c++) {
                if (isVertical) {
                    checkerCoreLogic(c, r, checkContext, checkType);
                } else {
                    checkerCoreLogic(r, c, checkContext, checkType);
                }
            }
        }        
    }
}

function checkerCoreLogic(row, col, checkContext, direction) {

    let row1 = 0, col1 = 0;

    if (direction == checkTypeEnum.ToRight ) {
        col1 = -1;
    } else if (direction == checkTypeEnum.ToBottom) {
        row1 = -1
    } else if (direction == checkTypeEnum.ToLeft) {
        col1 = +1
    } else if (direction == checkTypeEnum.ToUp) {
        row1 = +1
    }

    if (map[row][col].element.dataset.isfibo == "true") {
        //first element in the sequence
        if (checkContext.fiboSqeuence.length == 0) {
            checkContext.fiboSqeuence.push(map[row][col]);
            checkContext.counter++;
        }
        else if (checkContext.fiboSqeuence.length == 1 && //second element, 
            (Number(map[row + row1][col + col1].element.dataset.pos) + 1 == Number(map[row][col].element.dataset.pos) ||
                Number(map[row + row1][col + col1].element.dataset.pos) == 2 && Number(map[row][col].element.dataset.pos) == 2)) {
            if (Number(map[row + row1][col + col1].element.dataset.pos) == 2) {
                checkContext.gotFirst = true;
            }
            checkContext.fiboSqeuence.push(map[row][col]);
            checkContext.counter++;
        } else if (
            (map[row + row1][col + col1].element.dataset.pos && Number(map[row + row1][col + col1].element.dataset.pos) + 1 == Number(map[row][col].element.dataset.pos))) {

            checkContext.fiboSqeuence.push(map[row][col]);
            checkContext.counter++;
        }
        else {
            checkContext.fiboSqeuence = [];
            checkContext.counter = 0;
            //XXX: we had the 1 before, and the sequence allows 1, 1 -> so we have to re-add it;
            if (checkContext.gotFirst && map[row][col].value == 1 && map[row + row1][col + col1].value == 1) {
                checkContext.fiboSqeuence.push(map[row + row1][col + col1]);
                checkContext.counter++;
            } else if (map[row][col].value > 1) {
                checkContext.gotFirst = false;
            }
            checkContext.fiboSqeuence.push(map[row][col]);
            checkContext.counter++;
        }
        if (checkContext.counter == sequenceNumber) {
            prepareToClean(checkContext.fiboSqeuence);
        }
    }
    else {
        checkContext.gotFirst = false;
        checkContext.fiboSqeuence = [];
        checkContext.counter = 0;
    }
}


function colorFlash(element, isClean) {

    //DISCUSS: outsource and rename the class names
    let colorClass = isClean ? 'green' : 'yellow';
    element.classList.remove('green');
    element.classList.add(colorClass);
    element.style.animation = "none";
    //layout thrasing.  https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    //we need this workaround to re-animate the coloring effect.
    //We have to avoid the layout trashing. because the class will change from 'yellow' to 'green' for sure, than we can make it as an exeption
    //TODO: Check the possibility with setTimout. animation is this is quite resource heavy because of the layout trashing. 
    if (!isClean)
        element.offsetLeft;
    element.style.animation = null;
}

function prepareToClean(toCleanArray) {
    for (var i = 0; i < toCleanArray.length; i++) {
        toCleanArray[i].element.setAttribute('data-toclean', true);
    }
}

function cleanCell(cell) {
    cell.value = ' ';
    cell.element.setAttribute('data-isfibo', false);
    cell.element.setAttribute('data-toclean', false);
    colorFlash(cell.element, true);
}

function positionAtFibonacci(number) {

    if (number <= 1)
        return 2;

    let a = 0, b = 1, c = 1;
    let res = 1;

    //iterate to get the last Fibonacci number before the given
    while (c < number) {
        c = a + b;

        // res is the counter for the position in the sequence
        res++;
        a = b;
        b = c;
    }

    return res;
}

function isFibonacci(number) {
    if (!number)
        return false;
    //Regarding the wikipedia, a number is Fibonacci number if it is a perfect squeare 
    return isPerfectSqueare(5 * number * number + 4) || isPerfectSqueare(5 * number * number - 4);
}
function isPerfectSqueare(number) {
    var s = Number(Math.sqrt(number).toFixed(0))
    return (s * s === number);
}

generate();