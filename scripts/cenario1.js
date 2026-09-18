const TECLAS_USADAS = [37, 39, 69];
const VIDAS_INICIAIS = 5;
const TOTAL_PERGUNTAS = 4;
const estadoQuiz = {
    perguntas: [],
    perguntaAtual: 0,
    vidas: VIDAS_INICIAIS,
    pontuacao: 0,
    respostaBloqueada: false,
    finalizado: false
};

var bloquearAvanco = false;

document.addEventListener('click', () => {
    const audio = document.getElementById('tema');
    audio.play();
}, { once: true });

(() => {
    const letra = buscarLetraPersonagemSelecionado();
    const divPersonagem = document.querySelector('.personagem');
    divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_parado_direita.png')`
})();


document.addEventListener('keydown', (evento) => {
    if (evento.keyCode === 69 && bloquearAvanco && !evento.repeat) {
        iniciarQuiz();
        return;
    }

    if (!TECLAS_USADAS.includes(evento.keyCode) || bloquearAvanco) return;
    evento.preventDefault();
    const personagem = document.querySelector('.personagem');
    if (evento.keyCode === 39) {
        alterarDirecao('direita')
        let novaPosicao = removerPixels(window.getComputedStyle(personagem).left) + 15;
        personagem.style.left = `${novaPosicao}px`;
        validarPosicao(novaPosicao)
    }

    if (evento.keyCode === 37) {
        alterarDirecao('esquerda')
        personagem.style.left = `${removerPixels(window.getComputedStyle(personagem).left) - 15}px`;
    }

    if (!evento.repeat) {
        executarSomCaminhada();
    }
})

function validarPosicao(novaPosicao) {
    if (novaPosicao >= 445) {
        bloquearAvanco = true;
        const teclaE = document.querySelector('.tecla-e');
        teclaE.style.display = 'flex';
    }
}


function buscarLetraPersonagemSelecionado() {
    const personagem = sessionStorage.getItem('personagem');
    return personagem.split('-')[1]
}

function executarSomCaminhada() {
    const audio = new Audio('../assets/audios/caminhada.mp3');
    audio.playbackRate = 2.0;
    audio.play();
}


function alterarDirecao(direcao = 'esquerda') {
    const letra = buscarLetraPersonagemSelecionado();
    const divPersonagem = document.querySelector('.personagem');
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            if (i % 2 == 0) {
                divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_parado_${direcao}.png')`
            } else {
                divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagemA_mov_${direcao}.png')`
            }
        }, 100)
    }
    divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_mov_${direcao}.png')`
}



function removerPixels(valorComPixels) {
    return Number(valorComPixels.replace('px', ''))
}

async function iniciarQuiz() {
    estadoQuiz.perguntaAtual = 0;
    estadoQuiz.vidas = VIDAS_INICIAIS;
    estadoQuiz.pontuacao = 0;
    estadoQuiz.respostaBloqueada = false;
    estadoQuiz.finalizado = false;

    document.querySelector('.tecla-e').style.display = 'none';
    const modal = document.querySelector('.modal');
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    atualizarStatus();

    try {
        await carregarPerguntas();
        exibirPergunta();
    } catch (erro) {
        document.querySelector('#enunciado-pergunta').textContent =
            'Não foi possível carregar o quiz.';
        document.querySelector('#feedback-quiz').textContent = erro.message;
    }
}

function fecharQuiz() {
    const modal = document.querySelector('.modal');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
    bloquearAvanco = false;
    document.querySelector('.tecla-e').style.display = 'flex';
}

async function carregarPerguntas() {
    const turma = sessionStorage.getItem('turma') || 'BARE';
    const resposta = await fetch(`../assets/banco-de-perguntas/${turma}/historias.json`);

    if (!resposta.ok) {
        throw new Error(`Banco da turma ${turma} não encontrado.`);
    }

    const banco = await resposta.json();
    const historias = banco.historias || [];

    if (historias.length === 0) {
        throw new Error('Não existem histórias cadastradas para esta turma.');
    }

    const historia = historias[Math.floor(Math.random() * historias.length)];
    estadoQuiz.perguntas = historia.perguntas.slice(0, TOTAL_PERGUNTAS);

    if (estadoQuiz.perguntas.length < TOTAL_PERGUNTAS) {
        throw new Error(`A história precisa ter ${TOTAL_PERGUNTAS} perguntas.`);
    }
}

function exibirPergunta() {
    const pergunta = estadoQuiz.perguntas[estadoQuiz.perguntaAtual];
    const alternativas = document.querySelector('#alternativas-quiz');
    const feedback = document.querySelector('#feedback-quiz');

    document.querySelector('#progresso-quiz').textContent =
        `Pergunta ${estadoQuiz.perguntaAtual + 1} de ${TOTAL_PERGUNTAS}`;
    document.querySelector('#enunciado-pergunta').textContent = pergunta.enunciado;
    alternativas.innerHTML = '';
    feedback.textContent = '';
    document.querySelector('#proxima-pergunta').hidden = true;
    document.querySelector('#reiniciar-quiz').hidden = true;

    pergunta.alternativas.forEach((alternativa) => {
        const botao = document.createElement('button');
        botao.className = 'alternativa-quiz';
        botao.textContent = alternativa.conteudo;
        botao.addEventListener('click', () => responderPergunta(alternativa));
        alternativas.appendChild(botao);
    });
}

function responderPergunta(alternativa) {
    if (estadoQuiz.respostaBloqueada || estadoQuiz.finalizado) return;

    estadoQuiz.respostaBloqueada = true;
    const feedback = document.querySelector('#feedback-quiz');
    const botoes = document.querySelectorAll('.alternativa-quiz');
    botoes.forEach((botao) => { botao.disabled = true; });

    if (alternativa.assertividade === 'incorreto') {
        estadoQuiz.vidas -= 1;
        feedback.textContent = `${alternativa.complemento} Você perdeu uma vida.`;
        atualizarStatus();
        executarAnimacaoMorte();

        if (estadoQuiz.vidas === 0) {
            finalizarQuiz(false);
            return;
        }

        setTimeout(() => {
            restaurarPersonagem();
            estadoQuiz.respostaBloqueada = false;
            botoes.forEach((botao) => { botao.disabled = false; });
        }, 900);
        return;
    }

    estadoQuiz.pontuacao += Number(alternativa.pontos) || 0;
    feedback.textContent = alternativa.complemento;
    atualizarStatus();

    if (estadoQuiz.perguntaAtual === TOTAL_PERGUNTAS - 1) {
        finalizarQuiz(true);
        return;
    }

    setTimeout(() => {
        estadoQuiz.perguntaAtual += 1;
        estadoQuiz.respostaBloqueada = false;
        exibirPergunta();
    }, 900);
}

function atualizarStatus() {
    document.querySelector('#vidas-quiz').textContent =
        `Vidas: ${estadoQuiz.vidas}/${VIDAS_INICIAIS}`;
    document.querySelector('#pontuacao-quiz').textContent =
        `Pontuação: ${estadoQuiz.pontuacao}`;
    document.querySelector('#pontuacao-cenario').textContent =
        `Pontuação: ${estadoQuiz.pontuacao}`;
}

function executarAnimacaoMorte() {
    const letra = buscarLetraPersonagemSelecionado();
    document.querySelector('.personagem').style.background =
        `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_caindo.png')`;
}

function restaurarPersonagem() {
    const letra = buscarLetraPersonagemSelecionado();
    document.querySelector('.personagem').style.background =
        `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_parado_direita.png')`;
}

function finalizarQuiz(vitoria) {
    estadoQuiz.finalizado = true;
    estadoQuiz.respostaBloqueada = true;
    document.querySelector('#alternativas-quiz').innerHTML = '';
    document.querySelector('#proxima-pergunta').hidden = true;
    document.querySelector('#reiniciar-quiz').hidden = false;
    document.querySelector('#enunciado-pergunta').textContent = vitoria
        ? 'Ponte consertada!'
        : 'Game over!';
    document.querySelector('#feedback-quiz').textContent =
        `Pontuação final: ${estadoQuiz.pontuacao}`;
}

document.querySelector('#proxima-pergunta').addEventListener('click', () => {
    estadoQuiz.perguntaAtual += 1;
    estadoQuiz.respostaBloqueada = false;
    exibirPergunta();
});

document.querySelector('#reiniciar-quiz').addEventListener('click', iniciarQuiz);
document.querySelector('#fechar-quiz').addEventListener('click', fecharQuiz);
