const menu = document.getElementById('menu-navegacao');
const grid = document.getElementById('lista-conteudo');
const sidebar = document.getElementById('sidebar');
const btnHamburguer = document.getElementById('btn-hamburguer');
const estaLogado = localStorage.getItem('usuarioLogado') === 'true';

function carregarMenu() {
    if (estaLogado) {
        menu.innerHTML = `
            <a href="#" class="btn-menu" data-tipo="favoritos">Meus Favoritos</a>
            <a href="#" class="btn-menu" data-tipo="filme">Filmes</a>
            <a href="#" class="btn-menu" data-tipo="serie">Séries</a>
            <a href="#" class="btn-menu" data-tipo="minha-lista">Minha Lista</a>
        `;
    } else {
        menu.innerHTML = `
            <a href="#" class="btn-menu" data-tipo="filme">Filmes</a>
            <a href="#" class="btn-menu" data-tipo="serie">Séries</a>
            <a href="login.html">Iniciar Sessão</a>
        `;
    }
    configurarEventos();
}

async function carregarDados(tipo) {
    let endpoint = tipo === 'favoritos' ? 'user/favoritos' : 
                   tipo === 'minha-lista' ? 'user/lista' : 
                   tipo + 's';

    try {
        const res = await fetch(``);
        const dados = await res.json();
        
        grid.innerHTML = dados.map(item => `
            <div class="card" style="background-image: url(${item.poster})" 
                 onclick="location.href='detalhes.html?id=${item.id}'">
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = "";
    }
}

function configurarEventos() {
    document.querySelectorAll('.btn-menu').forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            carregarDados(link.dataset.tipo);
            sidebar.classList.remove('ativo');
        };
    });
}

btnHamburguer.onclick = () => {
    sidebar.classList.toggle('ativo');
};

carregarMenu();
carregarDados('filme');