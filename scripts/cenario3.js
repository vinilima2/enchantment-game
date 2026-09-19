history.pushState(null, '', location.href);
window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
});

const pontuacaoTotal = Number(sessionStorage.getItem('pontuacao-total')) || 0;

document.getElementById('pontuacao-total').textContent = pontuacaoTotal;

function executarSomTrofeu() {
    const audio = new Audio('../assets/audios/trofeu.mp3');
    audio.playbackRate = 2.0;
    audio.play();
}

executarSomTrofeu();

document.getElementById('jogar-novamente').addEventListener('click', () => {
    sessionStorage.removeItem('pontuacao-cenario1');
    sessionStorage.removeItem('pontuacao-total');
    window.location.replace('menu.html');
});
