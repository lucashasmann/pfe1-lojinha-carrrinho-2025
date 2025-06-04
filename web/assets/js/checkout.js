document.addEventListener('DOMContentLoaded', function() {
    // Atualizar contador do carrinho
    atualizarContadorCarrinho();
    
    // Carregar resumo do pedido
    carregarResumoPedido();
    
    // Configurar eventos de pagamento
    document.getElementById('pix').addEventListener('change', function() {
        document.getElementById('dados-cartao').style.display = 'none';
    });
    
    document.getElementById('cartao').addEventListener('change', function() {
        document.getElementById('dados-cartao').style.display = 'block';
    });
    
    // Buscar CEP
    document.getElementById('buscar-cep').addEventListener('click', buscarCEP);
    
    // Finalizar pagamento
    document.getElementById('finalizar-pagamento').addEventListener('click', finalizarPagamento);
});

function carregarResumoPedido() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const resumoPedido = document.getElementById('resumo-pedido');
    
    if (carrinho.length === 0) {
        window.location.href = 'index.html';
        return;
    }
    
    resumoPedido.innerHTML = '';
    
    carrinho.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'd-flex justify-content-between mb-2';
        itemElement.innerHTML = `
            <span>${item.nome} x${item.quantidade}</span>
            <span>R$ ${(item.preco * item.quantidade).toFixed(2)}</span>
        `;
        resumoPedido.appendChild(itemElement);
    });
    
    // Calcular totais
    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const frete = calcularFrete(subtotal);
    
    document.getElementById('checkout-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('checkout-frete').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `R$ ${(subtotal + frete).toFixed(2)}`;
}

function calcularFrete(subtotal) {
    // Frete fixo de R$ 15,00 ou grátis para compras acima de R$ 200,00
    return subtotal > 200 ? 0 : 15;
}

async function buscarCEP() {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
        alert('CEP inválido. Digite um CEP com 8 dígitos.');
        return;
    }
    
    try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const data = response.data;
        
        if (data.erro) {
            throw new Error('CEP não encontrado');
        }
        
        document.getElementById('endereco').value = data.logradouro;
        document.getElementById('cidade').value = data.localidade;
        document.getElementById('estado').value = data.uf;
        document.getElementById('complemento').focus();
    } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        alert('CEP não encontrado. Por favor, verifique e tente novamente.');
    }
}

function finalizarPagamento() {
    // Validar formulário
    const formEntrega = document.getElementById('form-entrega');
    if (!formEntrega.checkValidity()) {
        formEntrega.reportValidity();
        return;
    }
    
    // Coletar dados
    const dadosCliente = {
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        endereco: {
            cep: document.getElementById('cep').value,
            logradouro: document.getElementById('endereco').value,
            numero: document.getElementById('numero').value,
            complemento: document.getElementById('complemento').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value
        }
    };
    
    const metodoPagamento = document.getElementById('pix').checked ? 'pix' : 'cartao';
    
    const dadosPagamento = {
        metodo: metodoPagamento
    };
    
    if (metodoPagamento === 'cartao') {
        dadosPagamento.cartao = {
            numero: document.getElementById('numero-cartao').value,
            validade: document.getElementById('validade').value,
            cvv: document.getElementById('cvv').value,
            nome: document.getElementById('nome-cartao').value
        };
    }
    
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const subtotal = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    const frete = calcularFrete(subtotal);
    
    const pedido = {
        cliente: dadosCliente,
        itens: carrinho,
        pagamento: dadosPagamento,
        subtotal: subtotal,
        frete: frete,
        total: subtotal + frete,
        data: new Date().toISOString()
    };
    
    // Mostrar no console (como solicitado)
    console.log('Dados do Pedido:', JSON.stringify(pedido, null, 2));
    
    // Limpar carrinho
    localStorage.removeItem('carrinho');
    atualizarContadorCarrinho();
    
    // Mostrar mensagem de sucesso
    alert('Pedido realizado com sucesso! Obrigado por comprar na Loja do Corinthians.');
    window.location.href = 'index.html';
}

function atualizarContadorCarrinho() {
    const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
    
    document.querySelectorAll('#cart-count').forEach(element => {
        element.textContent = totalItens;
    });
}