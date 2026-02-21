const logado = localStorage.getItem('usuarioLogado') === 'true';
const token = localStorage.getItem('authToken');

if (!logado || !token) {
    window.location.href = 'login.html';
} else {
    // Restaurar token
    api.setToken(token);
    
    carregarPerfil();
}

async function carregarPerfil() {
    try {
        const usuario = await api.getCurrentUser();
        
        const elementoNome = document.getElementById('nome-perfil');
        const elementoEmail = document.getElementById('email-perfil');
        const elementoAvatar = document.getElementById('avatar-perfil');
        const elementoJuncao = document.getElementById('data-juncao');
        
        if (elementoNome) elementoNome.textContent = usuario.user.username;
        if (elementoEmail) elementoEmail.textContent = usuario.user.email;
        if (elementoAvatar && usuario.user.avatar) {
            elementoAvatar.src = usuario.user.avatar;
        }
        
        // Carregar favoritos
        carregarFavoritos();
    } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        if (error.status === 401) {
            // Token expirou
            logout();
        }
    }
}

async function carregarFavoritos() {
    try {
        const favResponse = await api.getFavorites(1, 5);
        const containerFavoritos = document.getElementById('meus-favoritos');
        
        if (!containerFavoritos) return;
        
        if (favResponse.results && favResponse.results.length > 0) {
            containerFavoritos.innerHTML = `
                <h3 style="grid-column: 1 / -1; color: #ffffff; margin-top: 0;">Meus Favoritos (${favResponse.total_results})</h3>
                ${favResponse.results.map(filme => `
                    <div class="filme-item" style="cursor: pointer;" onclick="window.location.href='detalhes.html?id=${filme.id}'">
                        <div class="card" style="background-image: url(https://image.tmdb.org/t/p/w500${filme.poster_path})"></div>
                        <h3 style="color: #ffffff; font-size: 0.95rem;">${filme.title}</h3>
                    </div>
                `).join('')}
            `;
        } else {
            containerFavoritos.innerHTML = '<p style="grid-column: 1 / -1; color: #ffffff;">Nenhum favorito ainda. <a href="principal.html">Explore filmes</a></p>';
        }
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
    }
}

function logout() {
    api.clearToken();
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('nomeUsuario');
    localStorage.removeItem('emailUsuario');
    localStorage.removeItem('usuarioId');
    window.location.href = 'login.html';
}

const botaoSair = document.getElementById('sair-sessao');
if (botaoSair) {
    botaoSair.onclick = logout;
}