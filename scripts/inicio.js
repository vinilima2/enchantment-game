history.pushState(null, '', location.href);
window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
});

function executarSomTema() {
    const audio = new Audio('../assets/audios/tema.mp3');
    audio.loop = true;
    audio.play().catch(() => {});
}

executarSomTema();

['personagem-A', 'personagem-B', 'personagem-C'].forEach(id => {
    const div = document.getElementById(id);

    div.addEventListener('mouseover', () => {
        executarSomToque();
    });
});

function selecionarPersonagem(evento) {
    executarSomToque();
    const personagem = evento.currentTarget.querySelector('img').id;
    sessionStorage.setItem('personagem', personagem);
    document.querySelector('#selecao-personagem').hidden = true;
    document.querySelector('#selecao-time').hidden = false;
}

function selecionarTime(evento) {
    executarSomToque();
    sessionStorage.setItem('turma', evento.currentTarget.dataset.turma);
    window.location.replace('cenario1.html');
}

function exibirTeclaE() {

}

function abrirModal() {

}

document.querySelector('#voltar-personagem').addEventListener('click', () => {
    executarSomToque();
    document.querySelector('#selecao-time').hidden = true;
    document.querySelector('#selecao-personagem').hidden = false;
});

const botaoInicio = document.querySelector('#botao-inicio');
if (botaoInicio) {
    botaoInicio.addEventListener('click', () => {
        executarSomToque();
        window.location.replace('menu.html');
    });
}

const botaoSair = document.querySelector('#botao-sair');
if (botaoSair) {
    botaoSair.addEventListener('click', () => {
        window.close();
    });
}

function executarSomToque() {
    const audio = new Audio('../assets/audios/selecao.mp3');
    audio.playbackRate = 2.0;
    audio.play().catch(() => {});
}