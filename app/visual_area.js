const VISUAL_FRAME_CLASSNAME = 'visual-area';
const VISUAL_FRAME_WIDTH = 800;
const DEFAULT_SEA_COLOR = '#a7f6fa';
const DEFAULT_SEA_HEIGHT = 60;
const DEFAULT_SEA_BORDER = { width: 15, color: '#56bad3' };
const DEFAULT_DROP_BORDER = { width: 5, color: '#8cbebf' };
const DEFAULT_DROP_COLOR = '#a6e2e3';

const SEA_WAVE_ADDITIONAL_COLOR = 'white';
const SEA_ADDITIONAL_COLOR = '#d4f5ff';
const AREA_GRADIENT_COLOR_FIRST = '#78c9f8';
const AREA_GRADIENT_COLOR_SECOND = '#aedcf6';
const AREA_GRADIENT_COLOR_THIRD = '#d3efff';
const UPDATE_FREQUENCY = 8;
const DROP_CREATING_FREQUENCY = 4000;
const SEA_INCREASE = 50;
const DROP_RADIUS = 50;


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

    getResult() {
        return this._result;
    }
}

//min & max include
function getRandomArbitrary(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class VisualArea extends Component{
    constructor(width, height, updateFrequency, onHit, onMiss, onGameOver) {
        super({ className: VISUAL_FRAME_CLASSNAME });
        this._updateFrequency = updateFrequency;
        this._width = width;
        this._height = height;
        this._onHit = onHit;
        this._onMiss = onMiss;
        this._onGameOver = onGameOver;
        this._drops = [];
    }

    buildHtmlElement() {
        const canvas = new Component({ tag: 'canvas', id: 'raindrops-canvas', attributes: [{ name: 'height', value: this._height }, { name: 'width', value: this._width }] });
        const popup = new Component({ id: 'pop-up', className: 'pop-up-notification', innerHtml: '' });
        this.appendComponent(canvas, popup);

        return super.buildHtmlElement();
    }

    init() {
        this._canvasContext = document.getElementById('raindrops-canvas').getContext('2d');
        this.renderBackground();
        this.createSea();
        this.renderDefaultSeaState();
        this._popUpRef = document.getElementById('pop-up');
    }

    startDropDown() {
        this.clear();
        this.startRerender();
        this.startDropCreating(DROP_CREATING_FREQUENCY);
    }

    clear() {
        clearInterval(this._rerenderInterval);
        clearInterval(this._creatingInterval);
        this._drops = [];
        this.renderBackground();
        this.renderDefaultSeaState();
        this._popUpRef.hidden = true
    }

    createSea() {
        this._sea = new DynamicShape(this._width, DEFAULT_SEA_HEIGHT, DEFAULT_SEA_COLOR, DEFAULT_SEA_BORDER, seaMoveHandler, seaIncreaseHandler);
    }

    renderDefaultSeaState() {
        this._sea.setSize(this._width, DEFAULT_SEA_HEIGHT);
        const x = 0;
        const y = this._height - this._sea.getHeight();
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
        const x = getRandomArbitrary(drop.getWidth(), this._width - drop.getWidth());
        const y = 0 - drop.getHeight();
        drop.setCoordinates(x, y);
        this._drops.push(drop);
    }
    
    createRandomMathDrop() {
        const a = getRandomArbitrary(1, 10);
        const b = getRandomArbitrary(1, 10);
        const operator = getRandomArbitrary(1, 3);

        switch (operator) {
            case 1:
                return new MathDrop(`${a} + ${b}`, a + b);
            case 2:
                const isNegative = a - b < 0;
                return isNegative ? this.createRandomMathDrop() : new MathDrop(`${a} - ${b}`, a - b);
            case 3:
                return new MathDrop(`${a} * ${b}`, a * b);
        }
    }

    renderDropsNextStep(drop) {
        drop.moveStep();
        this.renderDrop(drop.getX(), drop.getY(), drop.getWidth(), drop.getBorder(), drop.getColor(), drop.getExpression());

        const dropBottom = drop.getY() + drop.getHeight();
        const waterLevel = this._sea.getY();
        const isDropFallen = dropBottom >= waterLevel;
        if (isDropFallen) {
            this._drops.shift();
            this.upSea(waterLevel);
        }
    }

    shotHandler(value) {
        const index = this._drops.findIndex((drop) => drop.getResult() == value);
        if (index == -1) {
            this._onMiss();
            this.showAndHidePopUpMessage('-10');
        } else {
            this._onHit();
            this._drops.splice(index, 1);
        }
    }
    
    showAndHidePopUpMessage(text) {
        this.showPopUpMessage(text);
        setTimeout(() => this._popUpRef.hidden = true, 500);
    }

    showPopUpMessage(text) {
        this._popUpRef.hidden = false;
        this._popUpRef.innerHTML = text;
    }

    upSea(waterLevel) {
        const isFreeSpaceForRaindrop = waterLevel > (SEA_INCREASE + DROP_RADIUS * 2);
        if (isFreeSpaceForRaindrop) {
            this._sea.moving(SEA_INCREASE);
            this._sea.resizing(SEA_INCREASE);
        } else {
            this.gameOver(waterLevel);
        }
    }

    gameOver(waterLevel) {
        this._onGameOver();
        const timeout = waterLevel * UPDATE_FREQUENCY * 1.2;
        this.stopDropDown(timeout);
        this._sea.moving(waterLevel);
        this._sea.resizing(waterLevel);
    }

    stopDropDown(timeout) {
        clearInterval(this._creatingInterval);
        this._drops = [];
        setTimeout(() => {
            clearInterval(this._rerenderInterval);
            this.showPopUpMessage('Game over');
        }, timeout);
    }

    renderSea() {
        const { _sea } = this;
        
        _sea.setCoordinates(-15, _sea.getY() + 10);
        this._canvasContext.strokeStyle = SEA_WAVE_ADDITIONAL_COLOR;
        this._canvasContext.lineWidth = _sea.getBorder().width;
        this._canvasContext.beginPath();
        this._canvasContext.moveTo(_sea.getX(), _sea.getY());
        for (let i = 1; i < 50; i += 2) {
            const step = 20;
            this._canvasContext.lineTo(_sea.getX() + step * i, _sea.getY() - step);
            this._canvasContext.lineTo(_sea.getX() + step * (i + 1), _sea.getY());
        }
        this._canvasContext.stroke();
        _sea.setCoordinates(0, _sea.getY() - 10);

        const gradient = this._canvasContext.createLinearGradient(_sea.getX(), _sea.getY(), 0, this._height);
        gradient.addColorStop(0, _sea.getColor());
        gradient.addColorStop(.4, SEA_ADDITIONAL_COLOR);
        gradient.addColorStop(1, _sea.getColor());
        this._canvasContext.fillStyle = gradient;
        this._canvasContext.fillRect(_sea.getX(), _sea.getY(), _sea.getWidth(), _sea.getHeight());

        _sea.setCoordinates(0, _sea.getY() + 10);
        this._canvasContext.strokeStyle = _sea.getBorder().color;
        this._canvasContext.lineWidth = _sea.getBorder().width;
        this._canvasContext.beginPath();
        this._canvasContext.moveTo(_sea.getX() - 5, _sea.getY() + 5);
        for (let i = 1; i < 50; i += 2) {
            const step = 20;
            this._canvasContext.lineTo(_sea.getX() + step * i, _sea.getY() - step);
            this._canvasContext.lineTo(_sea.getX() + step * (i + 1), _sea.getY());
        }
        this._canvasContext.stroke();
        _sea.setCoordinates(0, _sea.getY() - 10);
    }

    renderDrop(x, y, radius, border, color, expression) {
        this._canvasContext.fillStyle = color;
        this._canvasContext.beginPath();
        this._canvasContext.ellipse(x, y, radius, radius, Math.PI / 4, 0, 2 * Math.PI);
        this._canvasContext.fill();

        this._canvasContext.strokeStyle = border.color;
        this._canvasContext.lineWidth = border.width;
        this._canvasContext.beginPath();
        this._canvasContext.ellipse(x, y, radius, radius, Math.PI / 4, 0, 2 * Math.PI)
        this._canvasContext.stroke();

        this._canvasContext.fillStyle = 'black';
        this._canvasContext.font = "20px Arial";
        this._canvasContext.fillText(expression, x - radius * expression.length / 10, y + 6);
    }

    renderBackground() {
        const gradient = this._canvasContext.createLinearGradient(0, 0, 0, this._height);
        gradient.addColorStop(0, AREA_GRADIENT_COLOR_FIRST);
        gradient.addColorStop(.5, AREA_GRADIENT_COLOR_SECOND);
        gradient.addColorStop(1, AREA_GRADIENT_COLOR_THIRD);
        this._canvasContext.fillStyle = gradient;
        this._canvasContext.fillRect(0, 0, this._width, this._height);
    }
}
