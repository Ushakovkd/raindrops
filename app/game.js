const DEFAULT_GAME_FRAME_HEIGHT = 600;

function gameInit() {
    const game = new Raindrops();
    game.init(document.body);
}

class Raindrops extends Component {
    constructor(gameFrameHeight = DEFAULT_GAME_FRAME_HEIGHT) {
        super({ id: 'game-container' })
        this._gameFrameHeight = gameFrameHeight;
    }

    play = () => {
        this._visualArea.startDropDown();
        this._calculateArea.setIsPlaying(true);
    }

    shot = (value) => {
        this._visualArea.shotHandler(value);
    }

    hit = () => {
        this._calculateArea.onHit();
    }

    miss = () => {
        this._calculateArea.onMiss();
    }

    gameOver = () => {
        this._calculateArea.setIsPlaying(false);
    }

    init(parentElement) {
        const buttonsGroup = new Component({ className: 'buttons-group' });
        const playButton = new Component({ tag: 'button', onClick: this.play, innerHtml: 'PLAY' });
        buttonsGroup.appendComponent(playButton);

        this._visualArea = new VisualArea(VISUAL_FRAME_WIDTH, this._gameFrameHeight, UPDATE_FREQUENCY, this.hit, this.miss, this.gameOver);
        this._calculateArea = new CalculateArea(this.shot);

        this.appendComponent(buttonsGroup, this._visualArea, this._calculateArea);

        parentElement.append(super.buildHtmlElement());

        this._visualArea.init();
        this._calculateArea.init();
    }
}