import Web3 from 'web3';
import configuration from '../build/contracts/Migrations.json';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;

document.addEventListener('DOMContentLoaded', async function() {
    // Adiciona um ouvinte de evento para o formulário
    document.getElementById('paymentForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Previne o envio do formulário

        // Obtém os valores dos inputs
        const from = document.getElementById('from').value.trim();
        const to = document.getElementById('to').value.trim();
        let amount = document.getElementById('amount').value.trim();

        // Converte o valor para Wei (1 ether = 10^18 Wei)
        amount = Web3.utils.toWei(amount, 'ether');

        // Chama a função sendPayment do contrato Solidity
        await sendPayment(from, to, amount);
    });
});

// Função para chamar a função sendPayment do contrato Solidity
async function sendPayment(from, to, amount) {
    try {
        // Solicita uma conta Ethereum ao usuário
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const fromAccount = from;
        console.log(amount);
        console.log(fromAccount);
        console.log(to);
        // Cria uma instância do contrato
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        // Chama a função sendPayment do contrato
        const result = await contract.methods.sendPayment(from, to, amount).send({ from: fromAccount, value: amount, to: to });

        // Exibe uma mensagem de sucesso
        document.getElementById('status').innerHTML = `<p>Transaction successful. Tx Hash: ${result.transactionHash}</p>`;

        // Atualiza o extrato de transações
        updateTransactionHistory(from);
        updateTransactionHistory(to);
    } catch (error) {
        // Em caso de erro, exibe uma mensagem de erro
        document.getElementById('status').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

