document.addEventListener("DOMContentLoaded", async function() {
    // Adiciona um ouvinte de evento para o formulário
    document.getElementById("paymentForm").addEventListener("submit", async function(event) {
        event.preventDefault(); // Previne o envio do formulário
        // Obtém os valores dos inputs
        const from = document.getElementById("from").value.trim();
        const to = document.getElementById("to").value.trim();
        const amount = document.getElementById("amount").value.trim();
        // Chama a função sendPayment do contrato Solidity
        await sendPayment(from, to, amount);
    });
});
// Função para chamar a função sendPayment do contrato Solidity
async function sendPayment(from, to, amount) {
    // Converte o valor do amount para Wei (1 ether = 10^18 Wei)
    const amountWei = web3.utils.toWei(amount, "ether");
    try {
        // Solicita uma conta Ethereum ao usuário
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts"
        });
        const fromAccount = accounts[0];
        // Define o contrato e a conta de envio
        const contract = new web3.eth.Contract(contractAbi, contractAddress, {
            from: fromAccount
        });
        // Chama a função sendPayment do contrato
        const result = await contract.methods.sendPayment(to, amountWei).send();
        // Exibe uma mensagem de sucesso
        document.getElementById("status").innerHTML = `<p>Transaction successful. Tx Hash: ${result.transactionHash}</p>`;
    } catch (error) {
        // Em caso de erro, exibe uma mensagem de erro
        document.getElementById("status").innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

//# sourceMappingURL=index.c36f364e.js.map
