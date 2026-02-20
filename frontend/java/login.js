const form = document.getElementById('incio-sessao');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (email && senha) {
        window.location.href = 'principal.html';
    }
});