document.addEventListener('DOMContentLoaded', function() {
    // Atualizar contador do carrinho
    atualizarContadorCarrinho();
    
    // Carregar produtos
    carregarProdutos();
    
    // Configurar eventos do modal
    const produtoModal = new bootstrap.Modal(document.getElementById('produtoModal'));
    
    // Evento para abrir modal quando um produto é clicado
    document.getElementById('produtos-container').addEventListener('click', function(e) {
        const card = e.target.closest('.produto-card');
        if (card) {
            const produtoId = parseInt(card.dataset.id);
            abrirModalProduto(produtoId);
        }
    });
    
    // Eventos para incrementar/decrementar quantidade no modal
    document.getElementById('incrementar').addEventListener('click', function() {
        const input = document.getElementById('quantidade');
        input.value = parseInt(input.value) + 1;
    });
    
    document.getElementById('decrementar').addEventListener('click', function() {
        const input = document.getElementById('quantidade');
        if (parseInt(input.value) > 1) {
            input.value = parseInt(input.value) - 1;
        }
    });
    
    // Evento para adicionar ao carrinho
    document.getElementById('adicionarAoCarrinho').addEventListener('click', function() {
        const produtoId = parseInt(this.dataset.id);
        const quantidade = parseInt(document.getElementById('quantidade').value);
        adicionarAoCarrinho(produtoId, quantidade);
        produtoModal.hide();
    });
});

let produtos = [];

async function carregarProdutos() {
    try {
        const response = await axios.get('./assets/dados.json');
        produtos = response.data;
        exibirProdutos(produtos);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

function exibirProdutos(produtos) {
    const container = document.getElementById('produtos-container');
    container.innerHTML = '';
    
    produtos.forEach(produto => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card produto-card h-100" data-id="${produto.id}">
                <img src="${produto.imagem}" class="card-img-top" alt="${produto.nome}">
                <div class="card-body">
                    <h5 class="card-title">${produto.nome}</h5>
                    <p class="card-text text-muted">${produto.descricao.substring(0, 60)}...</p>
                    <h5 class="text-danger">R$ ${produto.preco.toFixed(2)}</h5>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function abrirModalProduto(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;
    
    document.getElementById('modalProdutoTitulo').textContent = produto.nome;
    document.getElementById('modalProdutoNome').textContent = produto.nome;
    document.getElementById('modalProdutoImagem').src = produto.imagem;
    document.getElementById('modalProdutoDescricao').textContent = produto.descricao;
    document.getElementById('modalProdutoPreco').textContent = `R$ ${produto.preco.toFixed(2)}`;
    document.getElementById('quantidade').value = 1;
    document.getElementById('adicionarAoCarrinho').dataset.id = produto.id;
    
    const modal = new bootstrap.Modal(document.getElementById('produtoModal'));
    modal.show();
}

function adicionarAoCarrinho(produtoId, quantidade) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const produto = produtos.find(p => p.id === produtoId);
    
    if (!produto) return;
    
    const itemExistente = carrinho.find(item => item.id === produtoId);
    
    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            imagem: produto.imagem,
            quantidade: quantidade
        });
    }
    
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    
    // Mostrar notificação
    const toast = document.createElement('div');
    toast.className = 'position-fixed bottom-0 end-0 p-3';
    toast.style.zIndex = '11';
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-black text-white">
                <strong class="me-auto">Sucesso!</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${quantidade} ${quantidade > 1 ? 'itens' : 'item'} de ${produto.nome} adicionado(s) ao carrinho!
            </div>
        </div>
    `;
    document.body.appendChild(toast);
    
    // Remover notificação após 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    document.querySelectorAll('#cart-count').forEach(element => {
        element.textContent = totalItens;
    });
}