['personagem-A', 'personagem-B', 'personagem-C'].forEach(id => {
    const div = document.getElementById(id);

    div.addEventListener('mouseover', () => {
        tocarSelecao();
    })

});


function tocarSelecao() {
    const audio = document.getElementById('selecao');
    audio.play().catch(() => {});
}


function selecionarPersonagem(evento) {
    const personagem = evento.currentTarget.querySelector('img').id;
    sessionStorage.setItem('personagem', personagem);
    document.querySelector('#selecao-personagem').hidden = true;
    document.querySelector('#selecao-time').hidden = false;
}

function selecionarTime(evento) {
    sessionStorage.setItem('turma', evento.currentTarget.dataset.turma);
    window.location.href = 'cenario1.html';
}

function exibirTeclaE() {

}

function abrirModal() {

}

document.querySelector('#voltar-personagem').addEventListener('click', () => {
    document.querySelector('#selecao-time').hidden = true;
    document.querySelector('#selecao-personagem').hidden = false;
});