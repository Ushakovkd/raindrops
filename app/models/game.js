export default class GameArea {
    constructor() {
        this.area = document.createElement("canvas");
        this.context = area.getContext("2d");
        console.log('GameArea created');
    }
    
    drowGameArea() {
        this.context.fillStyle = "#FF0000";
        this.context.fillRect(0, 0, 150, 75);
        document.body.insertBefore(this.area, document.body.childNodes[0]);
    }
}