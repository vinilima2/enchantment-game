history.pushState(null, '', location.href);
window.addEventListener('popstate', () => {
    history.pushState(null, '', location.href);
});

function executarSomTrofeu() {
    const audio = new Audio('../assets/audios/trofeu.mp3');
    audio.playbackRate = 2.0;
    audio.play().catch(() => {});
}

executarSomTrofeu();

const tempoInicioJogo = Number(sessionStorage.getItem('tempoInicioJogo')) || Date.now();
const tempoTotalSegundos = Math.floor((Date.now() - tempoInicioJogo) / 1000);

const pontuacoesCategorias = obterPontuacoesSalvas();
const pontosGestaoTempo = calcularPontuacaoGestaoTempo(tempoTotalSegundos);
pontuacoesCategorias['gestao-e-eficiencia-do-tempo'] = pontosGestaoTempo;
salvarPontuacoes(pontuacoesCategorias);

let pontuacaoTotal = 0;
Object.values(pontuacoesCategorias).forEach(pts => {
    pontuacaoTotal += Number(pts) || 0;
});
sessionStorage.setItem('pontuacao-total', pontuacaoTotal);

const seloInfo = determinarSeloEncantamento(pontuacaoTotal, pontuacoesCategorias, false);

const container = document.getElementById('trofeu-conteudo');
if (container) {
    container.innerHTML = gerarHtmlRelatorioFinal({
        vitoria: true,
        tempoTotalSegundos,
        pontuacoesCategorias,
        pontuacaoTotal,
        seloInfo
    });

    const botaoJogarNovamente = document.getElementById('botao-jogar-novamente-relatorio');
    if (botaoJogarNovamente) {
        botaoJogarNovamente.addEventListener('click', () => {
            sessionStorage.removeItem('pontuacao-cenario1');
            sessionStorage.removeItem('vidas-cenario1');
            sessionStorage.removeItem('pontuacoes-categorias');
            sessionStorage.removeItem('pontuacao-total');
            sessionStorage.setItem('tempoInicioJogo', Date.now());
            window.location.replace('inicio.html');
        });
    }
}
