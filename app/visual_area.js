document.addEventListener('play', () => initVisualFrame());

function initVisualFrame() {
    const visualArea = new VisualArea(1000, 600, '#ededed', 20);
    const frameElement = visualArea.getRenderedFrameElement();
    document.body.append(frameElement);
    //It will be random
    const circle = new MathDrop('text');
    visualArea.addRenderObject(circle);
}

class Shape {
    constructor(width, height, color) {
        this._color = color;
        this._width = width;
        this._height = height;
    }

    setCoordinates(x, y) {
        this._x = x;
        this._y = y;
    }

    getCoordinateX() {
        return this._x;
    }

    getCoordinateY() {
        return this._y;
    }

    getHeight() {
        return this._height;
    }

    getWidth() {
        return this._width;
    }

    getColor() {
        return this._color;
    }
}

class Circle extends Shape {
    constructor(radius, color) {
        super(radius, radius, color);
    }
}

class MathDrop extends Circle {
    constructor(expression) {
        super(50, 'red');
        this._expression = expression;
    }
}

class VisualArea {
    constructor(width, height, background, updateFrequency) {
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

    addRenderObject(object) {
        //ToDo random
        object.setCoordinates(this._area.width / 2, 0 - object.getHeight());
        this._renderObjects.push(object);
        this.startRerender();
    }

    startRerender() {
        this._rerenderInterval = setInterval(() => this.reRender(), this._updateFrequency);
    }

    stopRerender() {
        clearInterval(this._rerenderInterval);
    }

    reRender() {
        console.log("rerender");
        if(this._renderObjects.length > 0) {
            this.clear();
            this.renderStep(this._renderObjects[0]);
        } else {
            this.stopRerender();
        }
    }

    renderStep(figure) {
        if (figure instanceof Circle) {
            this.drowCircle(figure.getCoordinateX(), figure.getCoordinateY(), figure.getWidth(), figure.getColor());
        } else {
            this.drowRectangle(figure.getCoordinateX(), figure.getCoordinateY(), figure.getWidth(), figure.getHeight(), figure.getColor())
        }
        figure.setCoordinates(figure.getCoordinateX(), figure.getCoordinateY() + 1);
        if((figure.getCoordinateY() + figure.getHeight()) > this._area.height) {
            this._renderObjects.splice(0, 1);
        }
    }

    drowRectangle(x, y, width, height, color) {
        this._areaContext.fillStyle = color;
        this._areaContext.fillRect(x, y, width, height);
    }

    drowCircle(x, y, radius, color) {
        this._areaContext.fillStyle = color;
        this._areaContext.beginPath();
        this._areaContext.ellipse(x, y, radius, radius, Math.PI / 4, 0, 2 * Math.PI);
        this._areaContext.fill();
    }

    clear() {
        this._areaContext.fillStyle = this._background;
        this._areaContext.clearRect(0, 0, this._area.height, this._area.width);
    }
}





