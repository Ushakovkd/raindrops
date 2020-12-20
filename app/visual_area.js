const DEFAULT_AREA_BACKGROUND_COLOR = '#ededed';
const DEFAULT_UPDATE_FREQUENCY = 10;
const DEFAULT_SEA_COLOR = '#9aeaed';
const DEFAULT_SEA_HEIGHT = 60;
const DEFAULT_SEA_BORDER = null;
const DEFAULT_SEA_INCREASE = 50;
const DEFAULT_DROP_BORDER = { width: 5, color: '#8cbebf' };
const DEFAULT_DROP_COLOR = '#a6e2e3';
const DEFAULT_DROP_RADIUS = 50;


document.addEventListener('play', () => initVisualFrame());

function initVisualFrame() {
    const visualArea = new VisualArea(1000, 600);
    const frameElement = visualArea.getRenderedFrameElement();
    document.body.append(frameElement);
    visualArea.startDropDown();
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
            if (++amount === stepsAmount){
                window.clearInterval(movingInterval);
            };
        }, DEFAULT_UPDATE_FREQUENCY);
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
        }, DEFAULT_UPDATE_FREQUENCY);
    }
}

class MathDrop extends DynamicShape {
    constructor(expression, radius = DEFAULT_DROP_RADIUS, color = DEFAULT_DROP_COLOR, border = DEFAULT_DROP_BORDER, moveHandler = dropDownMoveHandler) {
        super(radius, radius, color, border, moveHandler);
        this._expression = expression;
    }

    getExpression() {
        return this._expression;
    }
}

function getRandomArbitrary(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

class VisualArea {
    constructor(width, height, background = DEFAULT_AREA_BACKGROUND_COLOR, updateFrequency = DEFAULT_UPDATE_FREQUENCY) {
        this._background = background;
        this._updateFrequency = updateFrequency;
        this._area = document.createElement("canvas");
        this._area.width = width;
        this._area.height = height;
        this._area.style.background = background;
        this._areaContext = this._area.getContext("2d");
        this._renderObjects = [];
    }

    getRenderedFrameElement() {
        this.clear();
        return this._area;
    }

    startDropDown() {
        this.initSea();
        this.startRerender();
        this.startDropCreating(2000);
    }

    stopDropDown() {
        clearInterval(this._rerenderInterval);
        clearInterval(this._creatingInterval);
    }

    addRenderObject(object) {
        const x = getRandomArbitrary(object.getWidth(), this._area.width - object.getWidth());
        const y = 0 - object.getHeight();
        object.setCoordinates(x, y);
        this._renderObjects.push(object);
    }

    startDropCreating(interval) {
        this._creatingInterval = setInterval(() => this.addRenderObject(new MathDrop('29 + 30')), interval);
    }

    startRerender() {
        this._rerenderInterval = setInterval(() => this.reRender(), this._updateFrequency);
    }

    reRender() {
        if(this._renderObjects.length > 0) {
            console.log(`rerender ${this._renderObjects.length} object(s)`);
            this.clear();
            for (let obj of this._renderObjects) {
                this.renderMathDropStep(obj);
            }
            this.renderSeaStep();
        } else {
            console.log("waiting");
        }
    }

    renderMathDropStep(figure) {
        this.drowMathDrop(figure.getX(), figure.getY(), figure.getWidth(), figure.getBorder(), figure.getColor(), figure.getExpression());
        figure.moveStep();

        const isDrowned = (figure.getY() + figure.getHeight()) > this._sea.getY();
        const isFreeSpace = (this._sea.getY() - DEFAULT_SEA_INCREASE) > DEFAULT_DROP_RADIUS;
        //ToDo 
        if(!isFreeSpace) {
            this.stopDropDown();
        }
        if(isDrowned) {
            this._renderObjects.splice(0, 1);
            this._sea.moving(DEFAULT_SEA_INCREASE);
            this._sea.resizing(DEFAULT_SEA_INCREASE);
        }
    }

    initSea() {
        this._sea = new DynamicShape(this._area.width, DEFAULT_SEA_HEIGHT, DEFAULT_SEA_COLOR, DEFAULT_SEA_BORDER, seaMoveHandler, seaIncreaseHandler);
        this.renderSeaStep();
    }

    renderSeaStep() {
        const { _sea, _area } = this;
        const x = 0;
        const y = _area.height - _sea.getHeight();
        _sea.setCoordinates(x, y);
        this.drowRectangle(x, y, _area.width, _area.height, _sea.getColor())
    }

    drowRectangle(x, y, width, height, color) {
        this._areaContext.fillStyle = color;
        this._areaContext.fillRect(x, y, width, height);
    }

    drowMathDrop(x, y, radius, border, color, expression) {
        this._areaContext.fillStyle = color;
        this._areaContext.beginPath();
        this._areaContext.ellipse(x, y, radius, radius, Math.PI / 4, 0, 2 * Math.PI);
        this._areaContext.fill();

        this._areaContext.strokeStyle = border.color;
        this._areaContext.lineWidth = border.width;
        this._areaContext.beginPath();
        this._areaContext.ellipse(x, y, radius - 2.5 , radius - 2.5, Math.PI / 4, 0, 2 * Math.PI)
        this._areaContext.stroke();

        this._areaContext.fillStyle = 'black';
        this._areaContext.font = "20px Arial";
        this._areaContext.fillText(expression, x - radius * 0.7, y + 6);
    }

    clear() {
        this._areaContext.fillStyle = this._background;
        this._areaContext.clearRect(0, 0, this._area.width, this._area.height);
    }
}





