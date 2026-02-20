const fundo = document.getElementById('fundo');
const dadosFilme = document.getElementById('dados-filme');
const btnSalvar = document.getElementById('btnSalvar');

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function buscarFilme() {
    const res = await fetch();
    const f = await res.json();
    dadosFilme.innerHTML = `
        <img src="${f.poster}">
        <h2>${f.titulo}</h2>
    `;
}

btnSalvar.onclick = async () => {
    const nota = document.getElementById('nota').value;
    const texto = document.getElementById('comentario').value;

    await fetch('', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id_filme: id, nota: nota, texto: texto })
    });
    window.location.href = 'principal.html';
};

fundo.onclick = (e) => {
    if (e.target.id === 'fundo') window.location.href = 'principal.html';
};

buscarFilme();