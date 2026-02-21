const fundo = document.getElementById('fundo');
const conteudo = document.getElementById('conteudo-filme');
const review = document.getElementById('review');
const btnFavorito = document.getElementById('btn-favorito');
const btnLista = document.getElementById('btn-lista');

const params = new URLSearchParams(window.location.search);
const movieId = params.get('id');
const estaLogado = localStorage.getItem('usuarioLogado') === 'true';

// Restaurar token
const token = localStorage.getItem('authToken');
if (token) api.setToken(token);

async function carregar() {
    try {
        conteudo.innerHTML = '<p style="text-align:center">Carregando...</p>';
        
        const filme = await api.getMovieById(movieId);
        
        if (review) review.href = `review.html?id=${movieId}`;
        
        // Verificar se está nos favoritos
        if (estaLogado && btnFavorito) {
            try {
                const favResponse = await api.checkFavorite(movieId);
                if (favResponse.isFavorite) {
                    btnFavorito.textContent = 'Remover dos Favoritos';
                    btnFavorito.classList.add('favorito');
                } else {
                    btnFavorito.textContent = 'Favoritar';
                    btnFavorito.classList.remove('favorito');
                }
            } catch (err) {
                console.error('Erro ao verificar favorito:', err);
            }
        }
        
        const dataLancamento = new Date(filme.release_date).toLocaleDateString('pt-BR') || 'N/A';
        const duracao = filme.runtime ? `${filme.runtime} minutos` : 'N/A';
        const generos = Array.isArray(filme.genres) ? filme.genres.map(g => g.name || g).join(', ') : 'N/A';
        
        conteudo.innerHTML = `
            <h1 class="header">${filme.title || filme.name}</h1>
            <div class="flex">
                <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" class="poster" alt="${filme.title}">
                <div class="info">
                    <p>Título Original: <span>${filme.original_title || filme.original_name || 'N/A'}</span></p>
                    <p>Géneros: <span>${generos}</span></p>
                    <p>Duração: <span>${duracao}</span></p>
                    <p>Data de Lançamento: <span>${dataLancamento}</span></p>
                    <p>Avaliação: <span>${filme.vote_average}/10 (${filme.vote_count} votos)</span></p>
                    <p>Popularidade: <span>${filme.popularity}</span></p>
                    <p>Linguagem: <span>${(filme.original_language || 'N/A').toUpperCase()}</span></p>
                </div>
            </div>
            <p class="sinopse"><strong>Resumo:</strong> ${filme.overview || 'Sem descrição disponível'}</p>
            ${filme.tagline ? `<p class="sinopse"><em>"${filme.tagline}"</em></p>` : ''}
        `;
    } catch (err) {
        console.error('Erro ao carregar filme:', err);
        conteudo.innerHTML = '<p style="color:red">Erro ao carregar os detalhes do filme. Tente novamente.</p>';
    }
}

if (btnFavorito) {
    btnFavorito.onclick = async () => {
        if (!estaLogado) {
            alert('Faça login para usar favoritos');
            window.location.href = 'login.html';
            return;
        }
        
        try {
            if (btnFavorito.classList.contains('favorito')) {
                await api.removeFavorite(movieId);
                btnFavorito.textContent = 'Favoritar';
                btnFavorito.classList.remove('favorito');
            } else {
                await api.addFavorite(movieId);
                btnFavorito.textContent = 'Remover dos Favoritos';
                btnFavorito.classList.add('favorito');
            }
        } catch (err) {
            console.error('Erro ao atualizar favorito:', err);
            alert('Erro ao atualizar favorito');
        }
    };
}

if (btnLista) {
    btnLista.onclick = async () => {
        if (!estaLogado) {
            alert('Faça login para adicionar a listas');
            window.location.href = 'login.html';
            return;
        }

        try {
            let watchlist = await api.getWatchlistDefault();
            
            if (btnLista.classList.contains('na-lista')) {
                const itemId = btnLista.dataset.itemId;
                await api.removeListItem(watchlist.id, itemId);
                btnLista.classList.remove('na-lista');
                btnLista.textContent = 'Adicionar à Lista';
                btnLista.dataset.itemId = '';
            } else {
                await api.addListItem(watchlist.id, movieId);
                const fullList = await api.get(`/lists/${watchlist.id}`);
                const item = fullList.items.find(i => i.movie_id === parseInt(movieId));
                btnLista.classList.add('na-lista');
                btnLista.textContent = 'Remover da Lista';
                btnLista.dataset.itemId = item.id;
            }
        } catch (err) {
            console.error('Erro ao gerenciar watchlist:', err);
            alert('Erro ao gerenciar watchlist');
        }
    };
    
    if (estaLogado) {
        api.getWatchlistDefault().then(async watchlist => {
            const fullList = await api.get(`/lists/${watchlist.id}`);
            const item = fullList.items.find(i => i.movie_id === parseInt(movieId));
            if (item) {
                btnLista.classList.add('na-lista');
                btnLista.textContent = 'Remover da Lista';
                btnLista.dataset.itemId = item.id;
            }
        }).catch(err => console.error('Erro ao verificar lista:', err));
    }
}

fundo.onclick = (e) => {
    if (e.target.id === 'fundo') window.location.href = 'principal.html';
};

function logout(event) {
    event.preventDefault();
    api.clearToken();
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('nomeUsuario');
    localStorage.removeItem('emailUsuario');
    localStorage.removeItem('usuarioId');
    window.location.href = 'principal.html';
}

carregar();