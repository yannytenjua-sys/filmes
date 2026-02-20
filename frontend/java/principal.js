const container = document.getElementById('lista-filmes');
const inputBusca = document.getElementById('filtro');
let filmes = []; 

async function buscarDados() {
    try {
        const resposta = await fetch();
        const dados = await resposta.json();
        
        filmes = dados;
        
        mostrarNaTela(filmes);
        
    } catch (erro) {
        console.log("Erro ao carregar a API: ", erro);
        container.innerHTML = "<p>Erro ao carregar os filmes.</p>";
    }
}

function mostrarNaTela(lista) {
    container.innerHTML = ""; 
    
    lista.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        if(item.thumbnailUrl) {
            card.style.backgroundImage = `url(${item.thumbnailUrl})`;
            card.style.backgroundSize = 'cover';
        }
        
        container.appendChild(card);
    });
}

inputBusca.addEventListener('input', () => {
    const termo = inputBusca.value.toLowerCase();
    
    
    const filtrados = filmes.filter(f => {
        return f.title.toLowerCase().includes(termo);
    });
    
    mostrarNaTela(filtrados);
});

const card = document.createElement('div');
card.className = 'card';

card.onclick = () => {
    window.location.href = `detalhes.html?id=${filme.id}`;

};
buscarDados();