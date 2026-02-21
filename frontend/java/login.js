const form = document.getElementById('incio-sessao');
const msgErro = document.getElementById('msg-erro');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        if (msgErro) msgErro.textContent = 'Por favor, preencha todos os campos';
        return;
    }

    try {
        if (msgErro) msgErro.style.display = 'none';
        const response = await api.login(email, senha);
        
        // Armazenar token JWT
        api.setToken(response.token);
        
        // Armazenar dados do usuário
        localStorage.setItem('usuarioLogado', 'true');
        localStorage.setItem('nomeUsuario', response.user.username);
        localStorage.setItem('emailUsuario', response.user.email);
        localStorage.setItem('usuarioId', response.user.id);
        
        // Redirecionar para página principal
        window.location.href = 'principal.html';
    } catch (error) {
        if (msgErro) {
            msgErro.textContent = error.data?.error || 'Erro ao fazer login. Verifique suas credenciais.';
            msgErro.style.display = 'block';
        }
        console.error('Login error:', error);
    }
});