const DEFAULT_AREA_BACKGROUND_COLOR = '#ededed';
const DEFAULT_SEA_COLOR = '#9aeaed';
const DEFAULT_SEA_HEIGHT = 60;
const DEFAULT_SEA_BORDER = null;
const DEFAULT_DROP_BORDER = { width: 5, color: '#8cbebf' };
const DEFAULT_DROP_COLOR = '#a6e2e3';

const UPDATE_FREQUENCY = 8;
const DROP_CREATING_FREQUENCY = 4000;
const SEA_INCREASE = 50;
const DROP_RADIUS = 50;

var visualArea = null;

document.addEventListener('play', () => play());

function play() {
    if (visualArea === null) {
        initVisualFrame();
    }
    visualArea.startDropDown();
}

function initVisualFrame() {
    visualArea = new VisualArea(1000, 600);
    const frameElement = visualArea.getFrameElement();
    document.body.append(frameElement);
}

class Shape {
    _coordinates = { x: 0, y: 0 };
    constructor(width, height, color, border) {
        this._width = width;
        this._height = height;
        this._color = color;
        this._border = border;
    }

    setCoordinates(x, y) {
        this._coordinates = { x, y };
    }

    setSize(width, height) {
        this._width = width;
        this._height = height;
    }

    setColor(color) {
        this._color = color;
    }

    setBorder(width, color) {
        this._border = { width, color };
    }

    getCoordinates() {
        return this._coordinates;
    }

    getX() {
        return this._coordinates.x;
    }

    getY() {
        return this._coordinates.y;
    }

    getHeight() {
        return this._height;
    }

    getWidth() {
        return this._width;
    }

    getBorder() {
        return this._border;
    }

    getColor() {
        return this._color;
    }
}

const dropDownMoveHandler = (x, y) => {
    y++;
    return { x, y };
};

const seaMoveHandler = (x, y) => {
    y -= 1;
    return { x, y };
};

const seaIncreaseHandler = (width, height) => {
    height += 1;
    return { width, height };
}

class DynamicShape extends Shape {
    constructor(width, height, color, border, moveHandler = (x, y) => ({ x, y }), resizeHandler = (width, height) => ({ width, height })) {
        super(width, height, color, border);
        this._moveHandler = moveHandler;
        this._resizeHandler = resizeHandler;
    }

    moveStep() {
        const nextPoint = this._moveHandler(this._coordinates.x, this._coordinates.y);
        this.setCoordinates(nextPoint.x, nextPoint.y);
        return this._coordinates;
    }

    moving(stepsAmount) {
        let amount = 0;
        const movingInterval = setInterval(() => {
            this.moveStep();
            if (++amount === stepsAmount) {
                window.clearInterval(movingInterval);
            };
        }, UPDATE_FREQUENCY);
    }

    resizeStep() {
        const { width, height } = this._resizeHandler(this._width, this._height);
        this._width = width;
        this._height = height;
    }

    resizing(stepsAmount) {
        let amount = 0;
        const resizingInterval = setInterval(() => {
            this.resizeStep();
            if (++amount === stepsAmount){
                window.clearInterval(resizingInterval);
            };
        }, UPDATE_FREQUENCY);
    }
}

class MathDrop extends DynamicShape {
    constructor(expression, result, radius = DROP_RADIUS, color = DEFAULT_DROP_COLOR, border = DEFAULT_DROP_BORDER, moveHandler = dropDownMoveHandler) {
        super(radius, radius, color, border, moveHandler);
        this._expression = expression;
        this._result = result;
    }

    getExpression() {
        return this._expression;
    }
}

//min & max include
function getRandomArbitrary(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class VisualArea {
    constructor(width, height, background = DEFAULT_AREA_BACKGROUND_COLOR, updateFrequency = UPDATE_FREQUENCY) {
        this._background = background;
        this._updateFrequency = updateFrequency;
        this._area = document.createElement("canvas");
        this._area.width = width;
        this._area.height = height;
        this._area.style.background = background;
        this._areaContext = this._area.getContext("2d");
        this._drops = [];
    }

    getFrameElement() {
        return this._area;
    }

    startDropDown() {
        this.clear();
        this.initSea();
        this.startRerender();
        this.startDropCreating(DROP_CREATING_FREQUENCY);
    }

    clear() {
        clearInterval(this._rerenderInterval);
        clearInterval(this._creatingInterval);
        this._drops = [];
        this.renderBackground();
    }

    initSea() {
        this._sea = new DynamicShape(this._area.width, DEFAULT_SEA_HEIGHT, DEFAULT_SEA_COLOR, DEFAULT_SEA_BORDER, seaMoveHandler, seaIncreaseHandler);
        const x = 0;
        const y = this._area.height - this._sea.getHeight();
        this._sea.setCoordinates(x, y);

        this.renderSea();
    }

    startRerender() {
        this._rerenderInterval = setInterval(() => this.reRender(), this._updateFrequency);
    }

    stopRerender() {
        clearInterval(this._rerenderInterval);
    }

    reRender() {
        console.log(`rerender ${this._drops.length} object(s)`);
        this.renderBackground();
        for (let drop of this._drops) {
            this.renderDropsNextStep(drop);
        }
        this.renderSea();
    }

    startDropCreating(interval) {
        this.addFallingDrop();
        this._creatingInterval = setInterval(() => this.addFallingDrop(), interval);
    }

    addFallingDrop() {
        const drop = this.createRandomMathDrop();
        const x = getRandomArbitrary(drop.getWidth(), this._area.width - drop.getWidth());
        const y = 0 - drop.getHeight();
        drop.setCoordinates(x, y);
        this._drops.push(drop);
    }
    
    createRandomMathDrop() {
        const a = getRandomArbitrary(1, 99);
        const b = getRandomArbitrary(1, 99);
        const operator = getRandomArbitrary(1, 4);
        
        switch(operator) {
            case 1:
                return new MathDrop(`${a} + ${b}`, a + b);
            case 2:
                return new MathDrop(`${a} - ${b}`, a - b);
            case 3:
                return new MathDrop(`${a} * ${b}`, a * b);
            case 4:
                return new MathDrop(`${a} / ${b}`, a / b);
        }
    }

    renderDropsNextStep(figure) {
        figure.moveStep();
        this.renderDrop(figure.getX(), figure.getY(), figure.getWidth(), figure.getBorder(), figure.getColor(), figure.getExpression());

        const dropBottom = figure.getY() + figure.getHeight();
        const waterLevel = this._sea.getY();
        const isDropFallen = dropBottom >= waterLevel;
        if (isDropFallen) {
            this._drops.splice(0, 1);
            this.upSea(waterLevel);
        }
    }

    upSea(waterLevel) {
        const isFreeSpaceForRaindrop = waterLevel > (SEA_INCREASE + DROP_RADIUS * 2);
        if (isFreeSpaceForRaindrop) {
            this._sea.moving(SEA_INCREASE);
            this._sea.resizing(SEA_INCREASE);
        } else {
            const timeout = waterLevel * UPDATE_FREQUENCY * 1.2;
            this.stopDropDown(timeout);
            this._sea.moving(waterLevel);
            this._sea.resizing(waterLevel);
        }
    }

    stopDropDown(timeout) {
        clearInterval(this._creatingInterval);
        this._drops = [];
        setTimeout(() => {
            clearInterval(this._rerenderInterval)
        }, timeout);
    }

    renderSea() {
        const { _sea } = this;
        this._areaContext.fillStyle = _sea.getColor();
        this._areaContext.fillRect(_sea.getX(), _sea.getY(), _sea.getWidth(), _sea.getHeight());
    }

    renderDrop(x, y, radius, border, color, expression) {
        this._areaContext.fillStyle = color;
        this._areaContext.beginPath();
        this._areaContext.ellipse(x, y, radius, radius, Math.PI / 4, 0, 2 * Math.PI);
        this._areaContext.fill();

        this._areaContext.strokeStyle = border.color;
        this._areaContext.lineWidth = border.width;
        this._areaContext.beginPath();
        this._areaContext.ellipse(x, y, radius , radius, Math.PI / 4, 0, 2 * Math.PI)
        this._areaContext.stroke();

        this._areaContext.fillStyle = 'black';
        this._areaContext.font = "20px Arial";
        this._areaContext.fillText(expression, x - radius * expression.length / 10, y + 6);
    }

    renderBackground() {
        this._areaContext.fillStyle = this._background;
        this._areaContext.clearRect(0, 0, this._area.width, this._area.height);
    }
}





