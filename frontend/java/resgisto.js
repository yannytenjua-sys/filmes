const form = document.getElementById('registo');
const msgErro = document.getElementById('msg-erro');
const msgSucesso = document.getElementById('msg-sucesso');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmar = document.getElementById('confirmar').value;

    // Validações
    if (!username || !email || !senha || !confirmar) {
        mostrarErro('Por favor, preencha todos os campos');
        return;
    }

    if (senha !== confirmar) {
        mostrarErro('As palavras-passe são diferentes. Por favor, tente novamente.');
        return;
    }

    if (senha.length < 6) {
        mostrarErro('A palavra-passe deve ter no mínimo 6 caracteres');
        return;
    }

    try {
        limparMensagens();
        
        const response = await api.register(username, email, senha);
        
        // Armazenar token automaticamente após registro
        api.setToken(response.token);
        localStorage.setItem('usuarioLogado', 'true');
        localStorage.setItem('nomeUsuario', response.user.username);
        localStorage.setItem('emailUsuario', response.user.email);
        localStorage.setItem('usuarioId', response.user.id);
        
        mostrarSucesso('Conta criada com sucesso!');
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
            window.location.href = 'principal.html';
        }, 2000);
    } catch (error) {
        mostrarErro(error.data?.error || 'Erro ao criar conta. Tente novamente.');
        console.error('Register error:', error);
    }
});

function mostrarErro(mensagem) {
    if (msgErro) {
        msgErro.textContent = mensagem;
        msgErro.style.display = 'block';
    }
    if (msgSucesso) msgSucesso.style.display = 'none';
}

function mostrarSucesso(mensagem) {
    if (msgSucesso) {
        msgSucesso.textContent = mensagem;
        msgSucesso.style.display = 'block';
    }
    if (msgErro) msgErro.style.display = 'none';
}

function limparMensagens() {
    if (msgErro) msgErro.style.display = 'none';
    if (msgSucesso) msgSucesso.style.display = 'none';
}