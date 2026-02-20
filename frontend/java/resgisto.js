const form = document.getElementById('registo');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar').value;

    if (senha !== confirmar) {
        alert('As palavras-passe são diferentes. Por favor, tente novamente.');
    } else {
        alert('Conta criada com sucesso!');
        window.location.href = 'login.html';
    }
});