document.addEventListener('DOMContentLoaded', function() {
    // Atualizar contador do carrinho
    atualizarContadorCarrinho();
    
    // Carregar itens do carrinho
    carregarCarrinho();
    
    // Evento para remover item do carrinho
    document.getElementById('carrinho-itens').addEventListener('click', function(e) {
        if (e.target.classList.contains('remover-item')) {
            const itemId = parseInt(e.target.closest('.carrinho-item').dataset.id);
            removerItemDoCarrinho(itemId);
        }
    });
    
    // Evento para atualizar quantidade
    document.getElementById('carrinho-itens').addEventListener('change', function(e) {
        if (e.target.classList.contains('quantidade-item')) {
            const itemId = parseInt(e.target.closest('.carrinho-item').dataset.id);
            const novaQuantidade = parseInt(e.target.value);
            atualizarQuantidadeItem(itemId, novaQuantidade);
        }
    });
});

function carregarCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const carrinhoItens = document.getElementById('carrinho-itens');
    const carrinhoVazio = document.getElementById('carrinho-vazio');
    const finalizarCompra = document.getElementById('finalizar-compra');
    
    if (carrinho.length === 0) {
        carrinhoItens.innerHTML = '';
        carrinhoVazio.style.display = 'block';
        finalizarCompra.style.display = 'none';
        atualizarResumoPedido(0, 0);
        return;
    }
    
    carrinhoVazio.style.display = 'none';
    finalizarCompra.style.display = 'block';
    carrinhoItens.innerHTML = '';
    
    carrinho.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'row mb-3 carrinho-item';
        itemElement.dataset.id = item.id;
        itemElement.innerHTML = `
            <div class="col-md-2">
                <img src="${item.imagem}" class="img-fluid rounded" alt="${item.nome}">
            </div>
            <div class="col-md-6">
                <h5>${item.nome}</h5>
                <p class="text-muted">R$ ${item.preco.toFixed(2)}</p>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control quantidade-item" value="${item.quantidade}" min="1">
            </div>
            <div class="col-md-2 text-end">
                <h5>R$ ${(item.preco * item.quantidade).toFixed(2)}</h5>
                <button class="btn btn-link text-danger p-0 remover-item">Remover</button>
            </div>
        `;
        carrinhoItens.appendChild(itemElement);
    });
    
    // Calcular totais
    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const frete = calcularFrete(subtotal);
    
    atualizarResumoPedido(subtotal, frete);
}

function removerItemDoCarrinho(itemId) {
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    carrinho = carrinho.filter(item => item.id !== itemId);
    
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarContadorCarrinho();
    carregarCarrinho();
}

function atualizarQuantidadeItem(itemId, novaQuantidade) {
    if (novaQuantidade < 1) return;
    
    let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const item = carrinho.find(item => item.id === itemId);
    
    if (item) {
        item.quantidade = novaQuantidade;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        atualizarContadorCarrinho();
        carregarCarrinho();
    }
}

function calcularFrete(subtotal) {
    // Frete fixo de R$ 15,00 ou grátis para compras acima de R$ 200,00
    return subtotal > 200 ? 0 : 15;
}

function atualizarResumoPedido(subtotal, frete) {
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('frete').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`;
    document.getElementById('total').textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
}

function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    document.querySelectorAll('#cart-count').forEach(element => {
        element.textContent = totalItens;
    });
}