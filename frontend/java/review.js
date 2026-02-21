const fundo = document.getElementById('fundo');
const dadosFilme = document.getElementById('dados-filme');
const btnSalvar = document.getElementById('btnSalvar');
const msgErro = document.getElementById('msg-erro');

const params = new URLSearchParams(window.location.search);
const movieId = params.get('id');
const estaLogado = localStorage.getItem('usuarioLogado') === 'true';

// Restaurar token
const token = localStorage.getItem('authToken');
if (token) api.setToken(token);

// Verificar autenticação
if (!estaLogado) {
    alert('Você precisa estar logado para deixar uma review');
    window.location.href = 'login.html';
}

async function buscarFilme() {
    try {
        dadosFilme.innerHTML = '<p>Carregando...</p>';
        const filme = await api.getMovieById(movieId);
        
        dadosFilme.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${filme.poster_path}" alt="${filme.title}" style="max-width: 150px; border-radius: 8px;">
            <div>
                <h2>${filme.title || filme.name}</h2>
                <p>${filme.overview ? filme.overview.substring(0, 150) + '...' : 'Sem descrição'}</p>
            </div>
        `;
    } catch (err) {
        console.error('Erro ao carregar filme:', err);
        dadosFilme.innerHTML = '<p style="color:red">Erro ao carregar o filme</p>';
    }
}

if (btnSalvar) {
    btnSalvar.onclick = async () => {
        try {
            if (msgErro) msgErro.style.display = 'none';
            
            const titulo = document.getElementById('titulo').value || '';
            const nota = parseFloat(document.getElementById('nota').value);
            const comentario = document.getElementById('comentario').value || '';
            const comSpoilers = document.getElementById('spoilers').checked || false;
            
            // Validações
            if (!nota || nota < 0.5 || nota > 5.0) {
                exibirErro('Por favor, selecione uma nota entre 0.5 e 5.0');
                return;
            }
            
            btnSalvar.disabled = true;
            btnSalvar.textContent = 'Salvando...';
            
            const response = await api.createReview(
                parseInt(movieId),
                nota,
                titulo,
                comentario,
                comSpoilers
            );
            
            alert('Review salva com sucesso!');
            window.location.href = `detalhes.html?id=${movieId}`;
        } catch (error) {
            console.error('Erro ao salvar review:', error);
            exibirErro(error.data?.error || 'Erro ao salvar a review. Tente novamente.');
            if (btnSalvar) {
                btnSalvar.disabled = false;
                btnSalvar.textContent = 'Salvar Review';
            }
        }
    };
}

function exibirErro(mensagem) {
    if (msgErro) {
        msgErro.textContent = mensagem;
        msgErro.style.display = 'block';
    }
}

fundo.onclick = (e) => {
    if (e.target.id === 'fundo') window.location.href = 'principal.html';
};

buscarFilme();