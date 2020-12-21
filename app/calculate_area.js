const buttonLabels = ['7','8','9','Clear','4','5','6','1','2','3','Enter','0','Delete'];
const calculatorDisplayElementData = {tag: 'input', className: 'keyboard__display', value: '0', type: 'text'};
const calculateAreaData = {tag: 'div', className: 'calculate-area'}
const calculatorElementData = {tag: 'div', className: 'keyboard'}
const containerElementData = {tag: 'div', className: 'keyboard-wrapper'}

var calculateArea = null;

document.addEventListener('play', () => initCalculateArea());

function initCalculateArea() {
    if (calculateArea === null) {
    calculateArea = new CalculateArea();
    const calculateAreaHTMLElement = calculateArea.getHTMLElement();
    const gameContainer = document.getElementById("game-container");
    gameContainer.append(calculateAreaHTMLElement);
    console.log('init calculate area');
    }
}

class CalculateArea {
    constructor() {
        this._keyboard = new Keyboard();
    }

    getHTMLElement() {
        const calculateArea = createElement(calculateAreaData);
        calculateArea.append(this._keyboard.createKeyboardElement());
        calculateArea.style.height = `${DEFAULT_AREA_HEIGHT}px`;
        return calculateArea;
    }
}

class Keyboard {
    createKeyboardElement() {
        const calculatorElement = createElement(calculatorElementData);

        const calculatorDisplayElement = createElement(calculatorDisplayElementData);
        calculatorElement.append(calculatorDisplayElement);

        for (let i = 0; i < buttonLabels.length; i++) {
            const label = buttonLabels[i];
            const buttonElement = createElement({ tag: 'button', className: 'keyboard__button', innerHTML: label });
            if (label == "Clear" || label == "Enter") {
                buttonElement.classList.add('vertical-span_2', 'small_font');
            }
            if(label == "Delete") {
                buttonElement.classList.add('small_font');
            }
            if(label == "0") {
                buttonElement.classList.add('horizontal-span_2');
            }
            calculatorElement.append(buttonElement);
        }

        const calculatorContainerElement = createElement(containerElementData);
        calculatorContainerElement.append(calculatorElement);
        return calculatorContainerElement;
    }
}

class ScoreDisplay {

}

function createElement(data) {
    const {tag, className, value, type, innerHTML} = data;
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    if (value) {
        element.value = value;
    }
    if (type) {
        element.type = type;
    }
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    return element;
}