const DEFAULT_CALCULATE_AREA_CLASSNAME = 'calculate-area';
const DEFAULT_INPUT_BLOCK_CLASSNAME = 'input-block';
const INPUT_DISPLAY_COMPONENT_PARAMETERS = { tag: 'input', id: 'input-display', className: 'input-block__display', type: 'text', value: '', attributes: [{ name: 'disabled' }] };
const DEFAULT_KEYBOARD_CLASSNAME = 'keyboard';
const KEYBOARD_BUTTONS_DATA =
    [
        { label: '7' }, { label: '8' }, { label: '9' }, { label: 'Clear', template: 'high' },
        { label: '4' }, { label: '5' }, { label: '6' },
        { label: '1' }, { label: '2' }, { label: '3' }, { label: 'Enter', template: 'high' },
        { label: '0', template: 'wide' }, { label: 'Delete' }
    ];

var calculateArea = null;
var scoreScreen = null;

document.addEventListener('play', () => initCalculateArea());
document.addEventListener('hit', () => scoreScreen.innerHTML = Number(scoreScreen.innerHTML) + 10);
document.addEventListener('miss', () => scoreScreen.innerHTML = Number(scoreScreen.innerHTML) - 10);


function initCalculateArea() {
    if (calculateArea === null) {
        calculateArea = new CalculateArea();
        const calculateAreaHTMLElement = calculateArea.buildHtmlElement();

        const gameContainer = document.getElementById("game-container");
        gameContainer.append(calculateAreaHTMLElement);

        scoreScreen = document.getElementById('score-screen');
    }
}

class KeyboardButton extends Component {
    constructor(label, styleTemplate, onClick, tag = 'button', className = 'keyboard__button') {
        super({ tag, className, innerHtml: label, onClick });
        this._styleTemplate = styleTemplate;
    }

    buildHtmlElement() {
        const { _innerHtml, _styleTemplate } = this;
        if (_innerHtml.length > 1) {
            this.addClassName('small_font');
        }
        if (_styleTemplate === 'wide') {
            this.addClassName('horizontal-span_2');
        }
        if (_styleTemplate === 'high') {
            this.addClassName('vertical-span_2');
        }
        return super.buildHtmlElement();
    }

}

class Keyboard extends Component {
    constructor(eventHandler, className = DEFAULT_KEYBOARD_CLASSNAME) {
        super({ className });
        this._eventHandler = eventHandler;
    }

    buildHtmlElement() {
        for (let data of KEYBOARD_BUTTONS_DATA) {
            const button = new KeyboardButton(data.label, data.template, ({ target }) => this._eventHandler(target.innerHTML));
            this.appendComponent(button);
        }
        return super.buildHtmlElement();
    }
}

class InputBlock extends Component {
    constructor(onSubmit, className = DEFAULT_INPUT_BLOCK_CLASSNAME) {
        super({ className });
        this._onSubmit = onSubmit;
    }

    buildHtmlElement() {
        const inputDisplay = new Component(INPUT_DISPLAY_COMPONENT_PARAMETERS);
        const keyboard = new Keyboard((value) => this.keyboardClickHandler(value));

        this.appendComponent(inputDisplay, keyboard);

        return super.buildHtmlElement();
    }

    keyboardClickHandler(value) {
        if (!this._isValidDisplayRef) {
            this.initDisplayRef();
        }
        if (isNaN(parseInt(value))) {
            this.handleSymbol(value);
        } else {
            this.handleNumber(value);
        }
    }

    handleNumber(value) {
        this._displayRef.value = this._displayRef.value += value;
    }

    handleSymbol(value) {
        switch (value) {
            case 'Delete':
                this._displayRef.value = this._displayRef.value.slice(0, -1);
                break;
            case 'Enter':
                this._onSubmit(this._displayRef.value);
            case 'Clear':
                this._displayRef.value = '';
        }
    }

    initDisplayRef() {
        this._displayRef = document.getElementById(INPUT_DISPLAY_COMPONENT_PARAMETERS.id);
        this._isValidDisplayRef = this.validateDisplayRef(this._displayRef);
    }

    validateDisplayRef(ref) {
        const isValid = ref.id === INPUT_DISPLAY_COMPONENT_PARAMETERS.id && ref.className === INPUT_DISPLAY_COMPONENT_PARAMETERS.className;
        if (!isValid) {
            console.log("Invalid input value ref");
        }
        return isValid;
    }
}

class CalculateArea extends Component {
    constructor(className = DEFAULT_CALCULATE_AREA_CLASSNAME) {
        super({ className, attributes: [{ name: 'style', value: `height: ${GAME_FRAME_HEIGHT}px` }] });
    }

    buildHtmlElement() {
        const scoreScreen = new Component({ id: 'score-screen', className: 'score-screen', innerHtml: '0' });
        const inputBlock = new InputBlock((value) => this.onSubmit(value));
        this.appendComponent(scoreScreen, inputBlock);

        return super.buildHtmlElement();
    }

    onSubmit(value) {
        if (value.length > 0) {
            shootedValue = value;
            gameContainerRef.dispatchEvent(new Event('shoot', { bubbles: true }));
        }
    }
}
