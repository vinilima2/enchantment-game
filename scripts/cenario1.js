const TECLAS_USADAS = [37, 39, 69];
const VIDAS_INICIAIS = 5;
const TOTAL_PERGUNTAS = 4;
const estadoQuiz = {
    perguntas: [],
    perguntaAtual: 0,
    vidas: VIDAS_INICIAIS,
    pontuacao: 0,
    tempoDecorrido: 0,
    respostaBloqueada: false,
    finalizado: false
};

var bloquearAvanco = false;
var intervaloTempo = null;

atualizarStatus();
atualizarTempo();

document.body.style.backgroundImage = "url('../assets/cenarios/cenario_ponte_quebrada.jpeg')";

function executarSomTema() {
    const audio = new Audio('../assets/audios/tema.mp3');
    audio.loop = true;
    audio.play().catch(() => { });
}

executarSomTema();

(() => {
    const letra = buscarLetraPersonagemSelecionado();
    const divPersonagem = document.querySelector('.personagem');
    divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_parado_direita.png')`
})();


document.addEventListener('keydown', (evento) => {
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
    if (novaPosicao >= 350) {
        bloquearAvanco = true;
        iniciarQuiz();
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

function executarSomSucesso() {
    const audio = new Audio('../assets/audios/sucesso.mp3');
    audio.playbackRate = 2.0;
    audio.play();
}

function executarSomErro() {
    const audio = new Audio('../assets/audios/erro.mp3');
    audio.playbackRate = 2.0;
    audio.play();
}

function executarSomQueda() {
    const audio = new Audio('../assets/audios/queda.mp3');
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


    const modal = document.querySelector('.modal');
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    document.querySelector('.pontuacao-hud').classList.add('visivel');
    document.querySelector('.tempo-hud').classList.add('visivel');
    atualizarStatus();
    iniciarCronometro();

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
    feedback.className = '';
    feedback.textContent = '';
    document.querySelector('#proxima-pergunta').hidden = true;
    document.querySelector('#reiniciar-quiz').hidden = true;

    pergunta.alternativas.forEach((alternativa) => {
        const botao = document.createElement('button');
        botao.className = 'alternativa-quiz';
        botao.textContent = alternativa.conteudo;
        botao.addEventListener('click', () => responderPergunta(alternativa, botao));
        alternativas.appendChild(botao);
    });
}

function iniciarCronometro() {
    pararCronometro();
    estadoQuiz.tempoDecorrido = 0;
    atualizarTempo();

    intervaloTempo = setInterval(() => {
        estadoQuiz.tempoDecorrido += 1;
        atualizarTempo();
    }, 1000);
}

function pararCronometro() {
    if (intervaloTempo) {
        clearInterval(intervaloTempo);
        intervaloTempo = null;
    }
}

function atualizarTempo() {
    const minutos = Math.floor(estadoQuiz.tempoDecorrido / 60);
    const segundos = String(estadoQuiz.tempoDecorrido % 60).padStart(2, '0');
    const texto = `Tempo: ${minutos}:${segundos}`;
    document.querySelector('#tempo-quiz').textContent = texto;
    document.querySelector('#tempo-quiz-hud').textContent = texto;
}

function responderPergunta(alternativa, botaoSelecionado) {
    if (estadoQuiz.respostaBloqueada || estadoQuiz.finalizado) return;

    estadoQuiz.respostaBloqueada = true;
    const feedback = document.querySelector('#feedback-quiz');
    const botoes = document.querySelectorAll('.alternativa-quiz');
    botoes.forEach((botao) => { botao.disabled = true; });

    if (alternativa.assertividade === 'incorreto') {
        estadoQuiz.vidas -= 1;
        botaoSelecionado.classList.add('resposta-incorreta');
        feedback.className = 'feedback-incorreto';
        feedback.textContent = `${alternativa.complemento} Você perdeu uma vida.`;
        atualizarStatus();
        executarAnimacaoDerrota();
        executarSomErro();

        if (estadoQuiz.vidas === 0) {
            finalizarQuiz(false);
            return;
        }

        setTimeout(() => {
            restaurarPersonagem();
            feedback.className = '';
            feedback.textContent = '';
            estadoQuiz.respostaBloqueada = false;
            botoes.forEach((botao) => {
                botao.classList.remove('resposta-incorreta', 'resposta-correta');
                botao.disabled = false;
            });
        }, 1200);
        return;
    }

    estadoQuiz.pontuacao += Number(alternativa.pontos) || 0;
    botaoSelecionado.classList.add('resposta-correta');
    feedback.className = 'feedback-correto';
    feedback.textContent = alternativa.complemento;
    atualizarStatus();
    executarSomSucesso();

    if (estadoQuiz.perguntaAtual === TOTAL_PERGUNTAS - 1) {
        setTimeout(() => {
            finalizarQuiz(true);
        }, 1000);
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
    const textoPontuacao = `Pontuação: ${estadoQuiz.pontuacao}`;
    document.querySelector('#pontuacao-quiz-modal').textContent = textoPontuacao;
    document.querySelector('#pontuacao-quiz').textContent =
        `Pontuação: ${estadoQuiz.pontuacao}`;
    document.querySelector('#pontuacao-cenario').textContent =
        `Pontuação: ${estadoQuiz.pontuacao}`;
}

function executarAnimacaoDerrota() {
    const letra = buscarLetraPersonagemSelecionado();
    const personagem = document.querySelector('.personagem');
    personagem.style.left = `${removerPixels(personagem.style.left) + 45}px`
    personagem.style.background =
        `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_caindo.png')`;
}

function restaurarPersonagem() {
    const letra = buscarLetraPersonagemSelecionado();
    document.querySelector('.personagem').style.background =
        `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_parado_direita.png')`;
}

function finalizarQuiz(vitoria) {
    pararCronometro();
    estadoQuiz.finalizado = true;
    estadoQuiz.respostaBloqueada = true;

    if (!vitoria) {
        const modal = document.querySelector('.modal');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';

        const personagem = document.querySelector('.personagem');
        executarAnimacaoDerrota();

        setTimeout(() => {
            personagem.style.transition = 'bottom 0.8s ease-in';
            personagem.style.bottom = '-100px';
            executarSomQueda();

            setTimeout(() => {
                document.querySelector('#pontuacao-game-over').textContent =
                    `Pontuação: ${estadoQuiz.pontuacao}`;
                document.getElementById('game-over').hidden = false;
            }, 900);
        }, 400);
        return;
    }

    sessionStorage.setItem('pontuacao-cenario1', estadoQuiz.pontuacao);
    sessionStorage.setItem('vidas-cenario1', estadoQuiz.vidas);

    const modal = document.querySelector('.modal');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';

    document.body.style.backgroundImage = "url('../assets/cenarios/cenario_ponte_consertada.jpeg')";

    bloquearAvanco = false;

    const personagem = document.querySelector('.personagem');
    restaurarPersonagem();
    let posicaoAtual = removerPixels(window.getComputedStyle(personagem).left);
    personagem.style.left = `${posicaoAtual + 450}px`;

    const intervaloSaida = setInterval(() => {
        executarSomCaminhada();
        const posicaoAtual = removerPixels(window.getComputedStyle(personagem).left);
        alterarDirecao('direita');
        const novaPos = posicaoAtual + 25;
        personagem.style.left = `${novaPos}px`;
        if (novaPos >= 900) {
            clearInterval(intervaloSaida);
            window.location.replace('cenario2.html');
        }
    }, 200);
}

document.querySelector('#proxima-pergunta').addEventListener('click', () => {
    estadoQuiz.perguntaAtual += 1;
    estadoQuiz.respostaBloqueada = false;
    exibirPergunta();
});

document.querySelector('#reiniciar-quiz').addEventListener('click', iniciarQuiz);
document.querySelector('#fechar-quiz')?.addEventListener('click', fecharQuiz);

document.getElementById('reiniciar-jogo').addEventListener('click', () => {
    const personagem = document.querySelector('.personagem');
    document.getElementById('game-over').hidden = true;
    personagem.style.transition = '';
    personagem.style.bottom = '';
    personagem.style.left = '5px';
    restaurarPersonagem();
    bloquearAvanco = false;
});
