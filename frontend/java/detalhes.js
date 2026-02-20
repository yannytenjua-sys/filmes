const fundo = document.getElementById('fundo');
const conteudo = document.getElementById('conteudo-filme');
const review = document.getElementById('review');

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function carregar() {
    const res = await fetch(`${id}`);
    const f = await res.json();
    
    review.href = `review.html?id=${id}`;

    conteudo.innerHTML = `
        <h1 class="header">${f.titulo}</h1>
        <div class="flex">
            <img src="${f.poster}" class="poster">
            <div class="info">
                <p>Diretor: <span>${f.diretor}</span></p>
                <p>Duração: <span>${f.tempo}</span></p>
                <p>Data: <span>${f.data}</span></p>
            </div>
        </div>
        <p class="sinopse">${f.descricao}</p>
    `;
}

fundo.onclick = (e) => {
    if (e.target.id === 'fundo') window.location.href = 'principal.html';
};

carregar();