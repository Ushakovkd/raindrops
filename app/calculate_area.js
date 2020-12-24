const calculateAreaHTMLData = { tag: 'div', className: 'calculate-area' };
const inputBlockHTMLData = { tag: 'div', className: 'keyboard-wrapper' };
const inputDisplayHTMLData = { tag: 'input', className: 'keyboard__display', value: '', type: 'text' };
const keyboardHTMLData = { tag: 'div', className: 'keyboard' };
const keyboardButtonsData = 
    [
        { label: '7' }, { label: '8' }, { label: '9' }, { label: 'Clear', template: 'high' },
        { label: '4' }, { label: '5' }, { label: '6' },
        { label: '1' }, { label: '2' }, { label: '3' }, { label: 'Enter', template: 'high' },
        { label: '0', template: 'wide' }, { label: 'Delete' }
    ];

var calculateArea = null;

document.addEventListener('play', () => initCalculateArea());

function initCalculateArea() {
    if (calculateArea === null) {
        calculateArea = buildCalculateArea();
        const calculateAreaHTMLElement = calculateArea.buildHtmlElement();
        const gameContainer = document.getElementById("game-container");
        gameContainer.append(calculateAreaHTMLElement);
    }
}

function buildCalculateArea() {
    const keyboard = createKeyboard();

    const inputBlock = new InputBlock(inputBlockHTMLData);
    inputBlock.appendComponent(keyboard);

    const calculateArea = new CalculateArea(calculateAreaHTMLData);
    calculateArea.appendComponent(inputBlock);

    return calculateArea;
}


class KeyboardButton extends Component {
    constructor(label, styleTemplate, tag = 'button', className = 'keyboard__button') {
        super({tag, className, innerHtml: label});
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

class ScoreDisplay {

}

class InputBlock extends Component {
   constructor(data) {
       super(data);
   }
}

class CalculateArea extends Component {
    constructor(data) {
        super(data);
    }
}

function createKeyboard() {
    const keyboard = new Component(keyboardHTMLData);

    const inputDisplay = new Component(inputDisplayHTMLData);
    keyboard.appendComponent(inputDisplay);

    for (let data of keyboardButtonsData) {
        const button = new KeyboardButton(data.label, data.template);
        keyboard.appendComponent(button);
    }
    return keyboard;
}