const CATEGORIAS_ENCANTAMENTO = [
    {
        id: 'prontidao',
        nome: 'Prontidão',
        maximo: 600,
        descricao: 'Tempo até a abordagem ao primeiro obstáculo'
    },
    {
        id: 'encantamento',
        nome: 'Encantamento',
        maximo: 1200,
        descricao: 'Conexão emocional, atitude empática e acolhimento'
    },
    {
        id: 'personalizacao',
        nome: 'Personalização',
        maximo: 600,
        descricao: 'Identificação pelo nome e consideração do histórico'
    },
    {
        id: 'presenca-continua',
        nome: 'Presença Contínua',
        maximo: 600,
        descricao: 'Transparência e disponibilidade durante pausas'
    },
    {
        id: 'gestao-de-conflito',
        nome: 'Gestão de Conflitos',
        maximo: 1000,
        descricao: 'Contorno de insatisfações e postura conciliadora'
    },
    {
        id: 'atencao-a-solicitacao-do-cliente',
        nome: 'Atenção à Solicitação do Cliente',
        maximo: 1000,
        descricao: 'Escuta ativa e correta identificação da demanda'
    },
    {
        id: 'informacao-completa-e-correta-sem-prejuizo',
        nome: 'Informação Completa e Correta sem Prejuízo',
        maximo: 1500,
        descricao: 'Ausência de prejuízos, LGPD e assertividade'
    },
    {
        id: 'confirmacao-de-entendimento',
        nome: 'Confirmação de Entendimento',
        maximo: 1500,
        descricao: 'Garantia de ausência de dúvidas residuais'
    },
    {
        id: 'gestao-e-eficiencia-do-tempo',
        nome: 'Gestão e Eficiência do Tempo',
        maximo: 1000,
        descricao: 'Produtividade e conclusão no tempo ideal'
    },
    {
        id: 'cumprimento-do-fluxo-de-atendimento',
        nome: 'Cumprimento do Fluxo de Atendimento',
        maximo: 1000,
        descricao: 'Execução correta das rotinas e fluxos telefônicos'
    }
];

function normalizarTipoCategoria(tipo) {
    if (!tipo) return 'encantamento';
    const t = String(tipo).toLowerCase().trim();
    if (t === 'acolhimento') return 'encantamento';
    if (t === 'confirmacao-de-atendimento') return 'confirmacao-de-entendimento';
    return t;
}

function obterPontuacoesSalvas() {
    const defaultScores = {};
    CATEGORIAS_ENCANTAMENTO.forEach(cat => {
        defaultScores[cat.id] = 0;
    });

    try {
        const raw = sessionStorage.getItem('pontuacoes-categorias');
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaultScores, ...parsed };
        }
    } catch (e) {
        console.error('Erro ao ler pontuações do sessionStorage', e);
    }
    return defaultScores;
}

function salvarPontuacoes(pontuacoes) {
    sessionStorage.setItem('pontuacoes-categorias', JSON.stringify(pontuacoes));
}

function calcularPontuacaoProntidao(tempoSegundos) {
    const s = Math.max(0, Math.floor(tempoSegundos));
    if (s <= 10) {
        return 600;
    }
    return Math.max(0, 600 - (s - 10) * 100);
}

function calcularPontuacaoGestaoTempo(tempoTotalSegundos) {
    const s = Math.max(0, Math.floor(tempoTotalSegundos));
    const tempoIdealSegundos = 8 * 60; // 480s (8 minutos)
    if (s <= tempoIdealSegundos) {
        return 1000;
    }
    return Math.max(0, 1000 - (s - tempoIdealSegundos) * 2);
}

function determinarSeloEncantamento(totalPontos, pontuacoesCategorias, isGameOver) {
    if (isGameOver) {
        return {
            selo: 'N1',
            nome: 'Selo de Encantamento N1',
            classe: 'selo-n1',
            descricao: 'As 3 vidas foram esgotadas na jornada. Revise as diretrizes e tente novamente!'
        };
    }

    const encantamento = pontuacoesCategorias['encantamento'] || 0;
    const fluxo = pontuacoesCategorias['cumprimento-do-fluxo-de-atendimento'] || 0;
    const info = pontuacoesCategorias['informacao-completa-e-correta-sem-prejuizo'] || 0;

    if (totalPontos === 10000) {
        return {
            selo: 'N3',
            nome: 'Selo de Encantamento N3',
            classe: 'selo-n3',
            descricao: 'Desempenho perfeito! Demonstrou domínio total dos conceitos de Encantamento.'
        };
    }

    if (encantamento === 0 || (fluxo + info) === 0 || totalPontos < 5000) {
        return {
            selo: 'N1',
            nome: 'Selo de Encantamento N1',
            classe: 'selo-n1',
            descricao: 'Pontuação básica. Identifique oportunidades de melhoria e tente novamente.'
        };
    }

    if (totalPontos >= 8000 && totalPontos <= 9999 && encantamento >= 900) {
        return {
            selo: 'N2 Relacional',
            nome: 'Selo de Encantamento N2 Relacional',
            classe: 'selo-n2-relacional',
            descricao: 'Excelente conexão interpessoal, empatia e personalização com o cliente.'
        };
    }

    if (totalPontos >= 5000 && totalPontos <= 9999 && encantamento >= 300 && encantamento <= 899) {
        return {
            selo: 'N2 Funcional',
            nome: 'Selo de Encantamento N2 Funcional',
            classe: 'selo-n2-funcional',
            descricao: 'Atendimento resolutivo com bom cumprimento dos fluxos e procedimentos.'
        };
    }

    return {
        selo: 'N1',
        nome: 'Selo de Encantamento N1',
        classe: 'selo-n1',
        descricao: 'Pontuação básica. Revise os pontos de atenção e tente novamente.'
    };
}

function formatarTempoMinutosSegundos(segundosTotais) {
    const mins = Math.floor(segundosTotais / 60);
    const segs = String(segundosTotais % 60).padStart(2, '0');
    return `${mins}m ${segs}s (${String(mins).padStart(2, '0')}:${segs})`;
}

function gerarHtmlRelatorioFinal({
    vitoria,
    tempoTotalSegundos,
    pontuacoesCategorias,
    pontuacaoTotal,
    seloInfo
}) {
    const titulo = vitoria ? 'Vitória! Encantamento Concluído' : 'Game Over!';
    const fraseMotivacional = vitoria
        ? (seloInfo.selo === 'N3'
            ? 'Extraordinário! Você alcançou o nível máximo de encantamento com excelência impecável!'
            : 'Parabéns pela conclusão da jornada de encantamento! Confira sua avaliação abaixo:')
        : 'Não desanime! Toda oportunidade de atendimento é uma chance de aprendizado. Confira seu desempenho:';

    let categoriasHtml = '';
    CATEGORIAS_ENCANTAMENTO.forEach(cat => {
        const pontos = pontuacoesCategorias[cat.id] || 0;
        const porcentagem = Math.min(100, Math.round((pontos / cat.maximo) * 100));
        categoriasHtml += `
            <div class="relatorio-categoria-item">
                <div class="relatorio-categoria-cabecalho">
                    <span class="relatorio-categoria-nome">${cat.nome}</span>
                    <span class="relatorio-categoria-pontos"><strong>${pontos}</strong> / ${cat.maximo} pts</span>
                </div>
                <div class="relatorio-barra-progresso">
                    <div class="relatorio-barra-preenchimento" style="width: ${porcentagem}%"></div>
                </div>
            </div>
        `;
    });

    return `
        <div class="relatorio-card ${vitoria ? 'relatorio-vitoria' : 'relatorio-derrota'}">
            <h1 class="relatorio-titulo">${titulo}</h1>
            <p class="relatorio-frase">${fraseMotivacional}</p>

            <div class="relatorio-resumo-grid">
                <div class="relatorio-resumo-item">
                    <span class="resumo-label">Tempo Total</span>
                    <strong class="resumo-valor">${formatarTempoMinutosSegundos(tempoTotalSegundos)}</strong>
                </div>
                <div class="relatorio-resumo-item">
                    <span class="resumo-label">Pontuação Total</span>
                    <strong class="resumo-valor">${pontuacaoTotal} <small>/ 10.000 pts</small></strong>
                </div>
                <div class="relatorio-resumo-item selo-container ${seloInfo.classe}">
                    <span class="resumo-label">Classificação</span>
                    <strong class="selo-badge">${seloInfo.nome}</strong>
                    <span class="selo-descricao">${seloInfo.descricao}</span>
                </div>
            </div>

            <h2 class="relatorio-secao-titulo">Desempenho por Categoria de Encantamento</h2>
            <div class="relatorio-categorias-lista">
                ${categoriasHtml}
            </div>

            <button id="botao-jogar-novamente-relatorio" class="botao-relatorio-reiniciar" type="button">Jogar Novamente</button>
        </div>
    `;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CATEGORIAS_ENCANTAMENTO,
        normalizarTipoCategoria,
        calcularPontuacaoProntidao,
        calcularPontuacaoGestaoTempo,
        determinarSeloEncantamento,
        formatarTempoMinutosSegundos,
        gerarHtmlRelatorioFinal,
        obterPontuacoesSalvas,
        salvarPontuacoes
    };
}
