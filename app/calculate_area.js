const DEFAULT_SCORE_SCREEN_ID = 'score-screen';
const DEFAULT_SCORE_SCREEN_CLASSNAME = 'score-screen';
const DEFAULT_INPUT_DISPLAY_ID = 'input-display';
const DEFAULT_INPUT_DISPLAY_CLASSNAME = 'input-block__display';
const DEFAULT_CALCULATE_AREA_CLASSNAME = 'calculate-area';
const DEFAULT_INPUT_BLOCK_CLASSNAME = 'input-block';
const DEFAULT_KEYBOARD_CLASSNAME = 'keyboard';
const KEYBOARD_BUTTONS_DATA =
    [
        { label: '7' }, { label: '8' }, { label: '9' }, { label: 'Clear', template: 'high' },
        { label: '4' }, { label: '5' }, { label: '6' },
        { label: '1' }, { label: '2' }, { label: '3' }, { label: 'Enter', template: 'high' },
        { label: '0', template: 'wide' }, { label: 'Delete' }
    ];

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

class Display extends Component {
    constructor(id, className, initialValue) {
        super({ id, className, innerHtml: initialValue });
        this._displayedValue = initialValue;
    }

    init() {
        const elementRef = document.getElementById(this._id);
        this.setElementRef(elementRef);
    }

    setDisplayedValue(value) {
        this._elementRef.innerHTML = value;
    }
}


class InputBlock extends Component {
    constructor(onSubmit, className = DEFAULT_INPUT_BLOCK_CLASSNAME) {
        super({ className });
        this._onSubmit = onSubmit;
        this._inputValue = '';
        this._isPlaying = false;
    }

    buildHtmlElement() {
        this._inputDisplay = new Display(DEFAULT_INPUT_DISPLAY_ID, DEFAULT_INPUT_DISPLAY_CLASSNAME, this._inputValue);
        const keyboard = new Keyboard((value) => this.keyboardClickHandler(value));

        this.appendComponent(this._inputDisplay, keyboard);

        return super.buildHtmlElement();
    }

    keyboardClickHandler(value) {
        if (!this._isPlaying) {
            return;
        }
        if (isNaN(parseInt(value))) {
            this.handleSymbol(value);
        } else {
            this.handleNumber(value);
        }
    }

    handleNumber(value) {
        this._inputValue += value;
        this._inputDisplay.setDisplayedValue(this._inputValue);
    }

    handleSymbol(value) {
        switch (value) {
            case 'Delete':
                this._inputValue = this._inputValue.slice(0, -1);;
                this._inputDisplay.setDisplayedValue(this._inputValue);
                break;
            case 'Enter':
                if (value.length > 0) {
                    this._onSubmit(this._inputValue);
                }
            case 'Clear':
                this._inputValue = '';
                this._inputDisplay.setDisplayedValue(this._inputValue);
        }
    }

    setIsPlaying(value) {
        this._isPlaying = value;
    }

    init() {
        this._inputDisplay.init();
    }
}

class CalculateArea extends Component {
    constructor(onShot) {
        super({ className: DEFAULT_CALCULATE_AREA_CLASSNAME, attributes: [{ name: 'style', value: `height: ${DEFAULT_GAME_FRAME_HEIGHT}px` }] });
        this._onShot = onShot;
        this._score = 0;
    }

    buildHtmlElement() {
        this._scoreScreen = new Display(DEFAULT_SCORE_SCREEN_ID, DEFAULT_SCORE_SCREEN_CLASSNAME, this._score);
        this._inputBlock = new InputBlock(this._onShot);
        this.appendComponent(this._scoreScreen, this._inputBlock);

        return super.buildHtmlElement();
    }

    onMiss() {
        if (this._score >= 10) {
            this._score -= 10;
            this._scoreScreen.setDisplayedValue(this._score)
        }
    }

    onHit() {
        this._score += 10;
        this._scoreScreen.setDisplayedValue(this._score)
    }

    setIsPlaying(value) {
        this._inputBlock.setIsPlaying(value);
    }

    init() {
        this._scoreScreen.init();
        this._inputBlock.init();
    }
}
