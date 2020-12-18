function dispatch() {
    const button = this.event.target;
    const action = button.getAttribute('action');
    if (action === 'play') {
        const playEvent = new Event('play', {bubbles: true});
        button.dispatchEvent(playEvent);
    } else if (action === 'how-to-play') {
        alert("I don't know");
    }
}