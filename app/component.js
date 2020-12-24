const DEFAULT_HTML_ELEMENT_TAG = 'div';

class Component {
    constructor({tag = DEFAULT_HTML_ELEMENT_TAG, id, className, value, type, innerHtml, onClick}) {
        this._tag = tag;
        this._id = id;
        this._className = className;
        this._value = value;
        this._type = type;
        this._innerHtml = innerHtml;
        this._onClick = onClick;
        this._children = [];
    }

    appendComponent(component) {
        this._children.push(component);
    }

    buildHtmlElement() {
        const { _tag, _id, _className, _value, _type, _innerHtml, _onClick, _children } = this;
        const element = document.createElement(_tag);
        if (_id) {
            element.id = _id;
        }
        if (_className) {
            element.className = _className;
        }
        if (_value) {
            element.value = _value;
        }
        if (_type) {
            element.type = _type;
        }
        if (_innerHtml) {
            element.innerHTML = _innerHtml;
        }
        if(this._onClick) {
            element.onclick = _onClick;
        }
        for (let child of _children) {
            element.append(child.buildHtmlElement());
        }
        return element;
    }

    addClassName(className) {
        this._className += ` ${className}`;
    }

    setInnerHtml(innerHtml) {
        this._innerHtml = innerHtml;
    }
}
