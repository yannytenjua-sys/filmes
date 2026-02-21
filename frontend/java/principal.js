const menu = document.getElementById('menu-navegacao');
const grid = document.getElementById('lista-conteudo');
const sidebar = document.getElementById('sidebar');
const btnHamburguer = document.getElementById('btn-hamburguer');
const inputPesquisa = document.getElementById('filtro-nome');
const selectAno = document.getElementById('filtro-ano');
const estaLogado = localStorage.getItem('usuarioLogado') === 'true';

const token = localStorage.getItem('authToken');
if (token) {
    api.setToken(token);
}

let filtroAtual = {
    tipo: null,
    genero: null,
    ano: null,
    pesquisa: null
};

let watchlistDefault = null;

async function getWatchlist() {
    if (!estaLogado || watchlistDefault) return;
    try {
        watchlistDefault = await api.getWatchlistDefault();
    } catch (err) {
        console.error('Erro ao obter watchlist:', err);
    }
}

async function carregarMenu() {
    if (estaLogado) {
        menu.innerHTML = `
            <a href="#" class="btn-menu" data-tipo="favoritos">Meus Favoritos</a>
            <a href="#" class="btn-menu" data-tipo="watchlist">Minha Watchlist</a>
            <a href="#" class="btn-menu" data-tipo="filme">Filmes</a>
            <a href="#" class="btn-menu" data-tipo="serie">Séries</a>
        `;
        await getWatchlist();
    } else {
        menu.innerHTML = `
            <a href="#" class="btn-menu" data-tipo="filme">Filmes</a>
            <a href="#" class="btn-menu" data-tipo="serie">Séries</a>
            <a href="login.html">Iniciar Sessão</a>
        `;
    }
    configurarEventosMenu();
    await carregarGeneros();
    await carregarAnos();
}

async function carregarAnos() {
    try {
        const response = await api.getAvailableYears();
        if (response && response.years) {
            const anosOptions = response.years.map(year => 
                `<option value="${year}">${year}</option>`
            ).join('');
            
            selectAno.innerHTML = `
                <option value="">Todos os Anos</option>
                ${anosOptions}
            `;
        }
    } catch (err) {
        console.error('Erro ao carregar anos:', err);
    }
}

async function carregarGeneros() {
    try {
        const response = await api.getAvailableGenres();
        const container = document.getElementById('container-generos');
        
        if (!container) return;
        
        if (!response || !response.genres || response.genres.length === 0) {
            container.innerHTML = `<h4>Géneros</h4><p style="color: #999;">Nenhum género disponível</p>`;
            return;
        }
        
        const botoesGeneros = response.genres.map(gen => 
            `<button class="f-gen" data-gen="${gen.id}">${gen.name}</button>`
        ).join('');
        
        container.innerHTML = `
            <h4>Géneros</h4>
            <button class="f-gen ativo" data-gen="">Todos</button>
            ${botoesGeneros}
        `;
        
        document.querySelectorAll('.f-gen').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                document.querySelectorAll('.f-gen').forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                filtroAtual.genero = btn.dataset.gen || null;
                carregarDados();
            };
        });
    } catch (err) {
        console.error('Erro ao carregar géneros:', err);
    }
}

async function carregarDados() {
    grid.innerHTML = '<p style="text-align:center">Carregando...</p>';
    
    try {
        let dados = [];
        let response;
        
        const params = {
            page: 1,
            limit: 50,
            sort: 'created_at',
            order: 'DESC'
        };

        if (filtroAtual.pesquisa) params.search = filtroAtual.pesquisa;
        if (filtroAtual.ano) params.year = parseInt(filtroAtual.ano);
        if (filtroAtual.genero) params.genre = filtroAtual.genero;

        if (filtroAtual.tipo === 'favoritos') {
            if (!estaLogado) {
                grid.innerHTML = '<p>Faça login para ver seus favoritos</p>';
                return;
            }
            response = await api.getFavorites();
            dados = response.results || [];
            dados = aplicarFiltros(dados);
        } else if (filtroAtual.tipo === 'watchlist') {
            if (!estaLogado) {
                grid.innerHTML = '<p>Faça login para ver sua watchlist</p>';
                return;
            }
            if (!watchlistDefault) {
                await getWatchlist();
            }
            const fullList = await api.get(`/lists/${watchlistDefault.id}`);
            dados = (fullList.items || []).map(item => item.Movie);
            dados = aplicarFiltros(dados);
        } else if (filtroAtual.tipo === 'filme') {
            params.media_type = 'movie';
            response = await api.getMovies(params.page, params.limit, params.sort, params.order, params.media_type, params.search, params.year, params.genre);
            dados = response.results || [];
        } else if (filtroAtual.tipo === 'serie') {
            params.media_type = 'tv';
            response = await api.getMovies(params.page, params.limit, params.sort, params.order, params.media_type, params.search, params.year, params.genre);
            dados = response.results || [];
        } else {
            response = await api.getMovies(params.page, params.limit, params.sort, params.order, null, params.search, params.year, params.genre);
            dados = response.results || [];
        }
        
        if (dados.length === 0) {
            grid.innerHTML = '<p style="text-align:center">Nenhum conteúdo encontrado</p>';
            return;
        }
        
        grid.innerHTML = dados.map(item => `
            <div class="filme-item">
                <div class="card" style="background-image: url(https://image.tmdb.org/t/p/w500${item.poster_path})" 
                     onclick="location.href='detalhes.html?id=${item.id}'">
                </div>
                <h3>${item.title || item.name}</h3>
            
            </div>
        `).join('');
        
        atualizarEstadoBotoes();
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        grid.innerHTML = '<p style="text-align:center;color:red">Erro ao carregar conteúdo</p>';
    }
}

function aplicarFiltros(dados) {
    return dados.filter(item => {
        // Filtro por pesquisa
        if (filtroAtual.pesquisa) {
            const pesquisa = filtroAtual.pesquisa.toLowerCase();
            const titulo = (item.title || item.name || '').toLowerCase();
            const originalTitulo = (item.original_title || '').toLowerCase();
            if (!titulo.includes(pesquisa) && !originalTitulo.includes(pesquisa)) {
                return false;
            }
        }
        
        // Filtro por ano
        if (filtroAtual.ano) {
            const ano = parseInt(filtroAtual.ano);
            const dataLancamento = item.release_date || item.first_air_date || '';
            const anoLancamento = parseInt(dataLancamento.split('-')[0]);
            if (anoLancamento !== ano) {
                return false;
            }
        }
        
        // Filtro por género
        if (filtroAtual.genero) {
            const genreId = parseInt(filtroAtual.genero);
            const genres = item.genres || [];
            const temGenero = genres.some(g => g.id === genreId);
            if (!temGenero) {
                return false;
            }
        }
        
        return true;
    });
}

function configurarEventosMenu() {
    document.querySelectorAll('.btn-menu').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            filtroAtual.tipo = link.dataset.tipo;
            filtroAtual.genero = null;
            filtroAtual.ano = null;
            filtroAtual.pesquisa = null;
            
            document.querySelectorAll('.f-gen').forEach(b => b.classList.remove('ativo'));
            document.querySelector('.f-gen[data-gen=""]')?.classList.add('ativo');
            selectAno.value = '';
            inputPesquisa.value = '';
            
            carregarDados();
            sidebar.classList.remove('ativo');
        };
    });
}

function configurarFiltros() {
    selectAno.onchange = (e) => {
        filtroAtual.ano = e.target.value ? e.target.value : null;
        carregarDados();
    };

    let debounceTimer;
    inputPesquisa.oninput = (e) => {
        clearTimeout(debounceTimer);
        filtroAtual.pesquisa = e.target.value.trim() || null;
        debounceTimer = setTimeout(() => carregarDados(), 500);
    };
}

async function toggleFavorito(movieId, btn) {
    if (!estaLogado) {
        alert('Faça login para favoritar filmes');
        return;
    }
    
    try {
        const isFav = btn.classList.contains('favorito');
        if (isFav) {
            await api.removeFavorite(movieId);
            btn.classList.remove('favorito');
            btn.textContent = '❤️ Fav';
        } else {
            await api.addFavorite(movieId);
            btn.classList.add('favorito');
            btn.textContent = '❤️ Fav!';
        }
    } catch (err) {
        console.error('Erro ao atualizar favorito:', err);
    }
}

async function abrirAvaliar(movieId) {
    if (!estaLogado) {
        alert('Faça login para avaliar');
        return;
    }
    
    const classificacao = prompt('Classificação (0-5):');
    if (classificacao === null) return;
    
    const valor = parseFloat(classificacao);
    if (isNaN(valor) || valor < 0 || valor > 5) {
        alert('Insira um valor entre 0 e 5');
        return;
    }
    
    try {
        await api.createReview(movieId, valor);
        alert('Avaliação registrada com sucesso!');
    } catch (err) {
        console.error('Erro ao criar avaliação:', err);
        alert('Erro ao registrar avaliação');
    }
}

async function abrirAdicionarLista(movieId, btn) {
    if (!estaLogado) {
        alert('Faça login para adicionar a listas');
        return;
    }

    try {
        if (!watchlistDefault) {
            await getWatchlist();
        }

        if (watchlistDefault) {
            if (btn.classList.contains('na-lista')) {
                const itemId = btn.dataset.itemId;
                await api.removeListItem(watchlistDefault.id, itemId);
                btn.classList.remove('na-lista');
                btn.textContent = '📋 Lista';
                btn.dataset.itemId = '';
            } else {
                await api.addListItem(watchlistDefault.id, movieId);
                btn.classList.add('na-lista');
                btn.textContent = '📋 Lista!';
                const fullList = await api.get(`/lists/${watchlistDefault.id}`);
                const item = fullList.items.find(i => i.movie_id === movieId);
                btn.dataset.itemId = item.id;
            }
        } else {
            alert('Erro ao adicionar à watchlist');
        }
    } catch (err) {
        console.error('Erro ao adicionar à lista:', err);
        alert('Erro ao gerenciar watchlist');
    }
}

async function atualizarEstadoBotoes() {
    if (!estaLogado || !watchlistDefault) return;
    
    try {
        const fullList = await api.get(`/lists/${watchlistDefault.id}`);
        const movieIds = new Set((fullList.items || []).map(i => i.movie_id));
        const itemsMap = {};
        (fullList.items || []).forEach(i => {
            itemsMap[i.movie_id] = i.id;
        });
        
        document.querySelectorAll('.btn-lista').forEach(btn => {
            const movieId = parseInt(btn.dataset.id);
            if (movieIds.has(movieId)) {
                btn.classList.add('na-lista');
                btn.textContent = '📋 Lista!';
                btn.dataset.itemId = itemsMap[movieId];
            } else {
                btn.classList.remove('na-lista');
                btn.textContent = '📋 Lista';
                btn.dataset.itemId = '';
            }
        });
    } catch (err) {
        console.error('Erro ao atualizar estado dos botões:', err);
    }
}

btnHamburguer.onclick = () => {
    sidebar.classList.toggle('ativo');
};

carregarMenu();
configurarFiltros();
carregarDados();