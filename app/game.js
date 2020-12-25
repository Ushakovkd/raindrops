const GAME_FRAME_HEIGHT = 600;

const playEvent = new Event('play', { bubbles: true });
const playButtonHTMLData = { tag: 'button', onClick: () => this.event.target.dispatchEvent(playEvent), innerHtml: 'PLAY' };

var gameContainerRef = null;

function gameInit() {
    const buttonsGroup = new Component({ className: 'buttons-group' });

    const playButton = new Component(playButtonHTMLData);
    buttonsGroup.appendComponent(playButton);

    const gameContainer = new Component({ id: 'game-container' });
    gameContainer.appendComponent(buttonsGroup);

    document.body.append(gameContainer.buildHtmlElement());
    gameContainerRef = document.getElementById('game-container');
}