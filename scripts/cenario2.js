const TECLAS_USADAS = [37, 39, 69];
const VIDAS_INICIAIS = 3;
const TOTAL_PERGUNTAS = 7;

const estadoQuiz = {
    perguntas: [],
    perguntaAtual: 0,
    vidas: Number(sessionStorage.getItem('vidas-cenario1')) || VIDAS_INICIAIS,
    pontuacao: 0,
    pontuacoesCategorias: obterPontuacoesSalvas(),
    respostaBloqueada: false,
    finalizado: false
};

const personagem = document.querySelector('.personagem');
personagem.style.bottom = '235px';

var bloquearAvanco = false;
const tempoInicioJogo = Number(sessionStorage.getItem('tempoInicioJogo')) || Date.now();

function recalcularPontuacaoTotal() {
    let total = 0;
    Object.values(estadoQuiz.pontuacoesCategorias).forEach(pts => {
        total += Number(pts) || 0;
    });
    estadoQuiz.pontuacao = total;
}

recalcularPontuacaoTotal();
atualizarStatus();
atualizarTempo();
const timerInterval = setInterval(atualizarTempo, 1000);

document.body.style.backgroundImage = "url('../assets/cenarios/cenario_continuidade.jpeg')";

function executarSomTema() {
    const audio = new Audio('../assets/audios/tema.mp3');
    audio.loop = true;
    audio.play().catch(() => {});
}

executarSomTema();

(() => {
    const letra = buscarLetraPersonagemSelecionado();
    const divPersonagem = document.querySelector('.personagem');
    divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_parado_direita.png')`;
})();

document.addEventListener('keydown', (evento) => {
    if (!TECLAS_USADAS.includes(evento.keyCode) || bloquearAvanco) return;
    evento.preventDefault();
    const personagem = document.querySelector('.personagem');
    if (evento.keyCode === 39) {
        alterarDirecao('direita');
        let novaPosicao = removerPixels(window.getComputedStyle(personagem).left) + 15;
        personagem.style.left = `${novaPosicao}px`;
        validarPosicao(novaPosicao);
    }

    if (evento.keyCode === 37) {
        alterarDirecao('esquerda');
        personagem.style.left = `${removerPixels(window.getComputedStyle(personagem).left) - 15}px`;
    }
});

function validarPosicao(novaPosicao) {
    if (novaPosicao >= 950) {
        bloquearAvanco = true;
        iniciarQuiz();
    }
}

function buscarLetraPersonagemSelecionado() {
    const personagem = sessionStorage.getItem('personagem') || 'personagem-A';
    return personagem.split('-')[1] || 'A';
}

let ultimoSomPasso = 0;
function executarSomCaminhada() {
    const agora = Date.now();
    if (agora - ultimoSomPasso >= 280) {
        ultimoSomPasso = agora;
        const audio = new Audio('../assets/audios/caminhada.mp3');
        audio.playbackRate = 1.4;
        audio.play().catch(() => {});
    }
}

function executarSomSucesso() {
    const audio = new Audio('../assets/audios/sucesso.mp3');
    audio.playbackRate = 2.0;
    audio.play().catch(() => {});
}

function executarSomErro() {
    const audio = new Audio('../assets/audios/erro.mp3');
    audio.playbackRate = 2.0;
    audio.play().catch(() => {});
}

function executarSomQueda() {
    const audio = new Audio('../assets/audios/queda.mp3');
    audio.playbackRate = 2.0;
    audio.play().catch(() => {});
}

let direcaoAtual = 'direita';
let estadoPasso = 0;
let timerPararAnimacao = null;

function alterarDirecao(direcao = 'direita') {
    direcaoAtual = direcao;
    const letra = buscarLetraPersonagemSelecionado();
    const divPersonagem = document.querySelector('.personagem');

    estadoPasso = (estadoPasso + 1) % 2;
    const sufixo = estadoPasso === 1 ? `mov_${direcao}` : `parado_${direcao}`;
    divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_${sufixo}.png')`;

    executarSomCaminhada();

    clearTimeout(timerPararAnimacao);
    timerPararAnimacao = setTimeout(() => {
        divPersonagem.style.background = `url('../assets/animacoes/personagem ${letra}/animacao_personagem${letra}/personagem${letra}_parado_${direcaoAtual}.png')`;
    }, 180);
}

function removerPixels(valorComPixels) {
    return Number(valorComPixels.replace('px', ''));
}

async function iniciarQuiz() {
    estadoQuiz.perguntaAtual = 0;
    estadoQuiz.respostaBloqueada = false;
    estadoQuiz.finalizado = false;

    const modal = document.querySelector('.modal');
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    document.querySelector('.pontuacao-hud').classList.add('visivel');
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

    const historia = historias[0];
    estadoQuiz.perguntas = historia.perguntas.slice(7, 14);
    if (estadoQuiz.perguntas.length < TOTAL_PERGUNTAS) {
        throw new Error(`A história precisa ter ${TOTAL_PERGUNTAS} perguntas.`);
    }
}

function exibirPergunta() {
    const pergunta = estadoQuiz.perguntas[estadoQuiz.perguntaAtual];
    const alternativas = document.querySelector('#alternativas-quiz');
    const feedback = document.querySelector('#feedback-quiz');

    document.querySelector('#progresso-quiz').textContent =
        `Pergunta ${estadoQuiz.perguntaAtual + 8} de 14`;
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

function atualizarTempo() {
    const tempoDecorrido = Math.floor((Date.now() - tempoInicioJogo) / 1000);
    const minutos = Math.floor(tempoDecorrido / 60);
    const segundos = String(tempoDecorrido % 60).padStart(2, '0');
    document.querySelector('#tempo-quiz-hud').textContent = `Tempo: ${minutos}:${segundos}`;
}

function responderPergunta(alternativa, botaoSelecionado) {
    if (estadoQuiz.respostaBloqueada || estadoQuiz.finalizado) return;

    estadoQuiz.respostaBloqueada = true;
    const feedback = document.querySelector('#feedback-quiz');
    const botoes = document.querySelectorAll('.alternativa-quiz');
    botoes.forEach((botao) => { botao.disabled = true; });

    const perguntaAtualObj = estadoQuiz.perguntas[estadoQuiz.perguntaAtual];
    const categoriaId = normalizarTipoCategoria(perguntaAtualObj.tipo);

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
        }, 3500);
        return;
    }

    const pontosGanhos = Number(alternativa.pontos) || 0;
    estadoQuiz.pontuacoesCategorias[categoriaId] = (estadoQuiz.pontuacoesCategorias[categoriaId] || 0) + pontosGanhos;
    salvarPontuacoes(estadoQuiz.pontuacoesCategorias);
    recalcularPontuacaoTotal();

    botaoSelecionado.classList.add('resposta-correta');
    feedback.className = 'feedback-correto';
    feedback.textContent = alternativa.complemento;
    atualizarStatus();
    executarSomSucesso();

    if (estadoQuiz.perguntaAtual === TOTAL_PERGUNTAS - 1) {
        setTimeout(() => {
            finalizarQuiz(true);
        }, 3500);
        return;
    }

    setTimeout(() => {
        estadoQuiz.perguntaAtual += 1;
        estadoQuiz.respostaBloqueada = false;
        exibirPergunta();
    }, 3500);
}

function atualizarStatus() {
    const textoVidas = `Vidas: ${estadoQuiz.vidas}/${VIDAS_INICIAIS}`;
    document.querySelector('#vidas-quiz').textContent = textoVidas;
    document.querySelector('#vidas-quiz-modal').textContent = textoVidas;
    const textoPontuacao = `Pontuação: ${estadoQuiz.pontuacao}`;
    document.querySelector('#pontuacao-quiz-modal').textContent = textoPontuacao;
    document.querySelector('#pontuacao-quiz').textContent = textoPontuacao;
    document.querySelector('#pontuacao-cenario').textContent = textoPontuacao;
}

function executarAnimacaoDerrota() {
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

    if (!vitoria) {
        clearInterval(timerInterval);
        const modal = document.querySelector('.modal');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';

        const personagem = document.querySelector('.personagem');
        executarAnimacaoDerrota();

        setTimeout(() => {
            personagem.style.transition = 'bottom 0.8s ease-in';
            personagem.style.bottom = '-200px';
            executarSomQueda();

            setTimeout(() => {
                const tempoTotalSegundos = Math.floor((Date.now() - tempoInicioJogo) / 1000);
                const pontosTempo = calcularPontuacaoGestaoTempo(tempoTotalSegundos);
                estadoQuiz.pontuacoesCategorias['gestao-e-eficiencia-do-tempo'] = pontosTempo;
                salvarPontuacoes(estadoQuiz.pontuacoesCategorias);
                recalcularPontuacaoTotal();

                const seloInfo = determinarSeloEncantamento(estadoQuiz.pontuacao, estadoQuiz.pontuacoesCategorias, true);
                const containerGameOver = document.querySelector('.game-over-conteudo');
                containerGameOver.innerHTML = gerarHtmlRelatorioFinal({
                    vitoria: false,
                    tempoTotalSegundos,
                    pontuacoesCategorias: estadoQuiz.pontuacoesCategorias,
                    pontuacaoTotal: estadoQuiz.pontuacao,
                    seloInfo
                });

                document.getElementById('botao-jogar-novamente-relatorio').addEventListener('click', () => {
                    sessionStorage.removeItem('pontuacao-cenario1');
                    sessionStorage.removeItem('vidas-cenario1');
                    sessionStorage.removeItem('pontuacoes-categorias');
                    sessionStorage.removeItem('pontuacao-total');
                    sessionStorage.setItem('tempoInicioJogo', Date.now());
                    window.location.replace('inicio.html');
                });

                document.getElementById('game-over').hidden = false;
            }, 900);
        }, 400);
        return;
    }

    sessionStorage.setItem('pontuacao-total', estadoQuiz.pontuacao);
    salvarPontuacoes(estadoQuiz.pontuacoesCategorias);

    const modal = document.querySelector('.modal');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';

    bloquearAvanco = false;

    const personagem = document.querySelector('.personagem');
    restaurarPersonagem();

    const intervaloSaida = setInterval(() => {
        executarSomCaminhada();
        const pos = removerPixels(window.getComputedStyle(personagem).left);
        alterarDirecao('direita');
        const novaPos = pos + 25;
        personagem.style.left = `${novaPos}px`;

        if (novaPos >= 850) {
            clearInterval(intervaloSaida);
            window.location.replace('cenario3.html');
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