function executarSomTema() {
    const audio = new Audio('../assets/audios/tema.mp3');
    audio.loop = true;
    audio.play().catch(() => {});
}

executarSomTema();

document.querySelector('#jogar').addEventListener('click', () => {
    executarSomToque();
    window.location.replace('inicio.html');
});

document.querySelector('#sair').addEventListener('click', () => {
    window.close();
});

function executarSomToque() {
    const audio = new Audio('../assets/audios/selecao.mp3');
    audio.playbackRate = 2.0;
    audio.play();
}