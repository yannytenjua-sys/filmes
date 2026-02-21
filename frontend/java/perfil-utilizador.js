const logado = localStorage.getItem('usuarioLogado') === 'true';

if (!logado) {
    window.location.href = 'login.html';
} else {
    const nome = localStorage.getItem('nomeUsuario') || "Utilizador";
    const email = localStorage.getItem('emailUsuario') || "utilizador@email.pt";

    const elementoNome = document.getElementById('nome-perfil');
    const elementoEmail = document.getElementById('email-perfil');

    if (elementoNome) elementoNome.innerText = nome;
    if (elementoEmail) elementoEmail.innerText = email;

    const botaoSair = document.getElementById('sair-sessao');
    if (botaoSair) {
        botaoSair.onclick = () => {
            localStorage.removeItem('usuarioLogado');
            window.location.href = 'login.html';
        };
    }
}