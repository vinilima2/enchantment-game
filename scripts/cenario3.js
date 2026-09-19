const pontuacaoTotal = Number(sessionStorage.getItem('pontuacao-total')) || 0;

document.getElementById('pontuacao-total').textContent = pontuacaoTotal;

document.addEventListener('click', () => {
    const audio = document.getElementById('tema');
    audio.play();
}, { once: true });

document.getElementById('jogar-novamente').addEventListener('click', () => {
    sessionStorage.removeItem('pontuacao-cenario1');
    sessionStorage.removeItem('pontuacao-total');
    window.location.href = 'menu.html';
});
