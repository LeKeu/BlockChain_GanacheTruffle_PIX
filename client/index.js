import Web3 from 'web3';
import configuration from '../build/contracts/Migrations.json';

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;

document.addEventListener('DOMContentLoaded', async function() {
    document.getElementById('paymentForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        const from = accounts[0];
        const to = document.getElementById('to').value.trim();
        let amount = document.getElementById('amount').value.trim();

        amount = Web3.utils.toWei(amount, 'ether');

        await sendPayment(from, to, amount);
    });

    await updateFromAccount();

    window.ethereum.on('accountsChanged', updateFromAccount);
});

async function sendPayment(from, to, amount) {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        //const fromAccount = from;
        const fromAccount = accounts[0];
        console.log(amount);
        console.log(fromAccount);
        console.log(to);
        
        const web3 = new Web3(window.ethereum);
        const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        const result = await contract.methods.sendPayment(from, to, amount).send({ from: fromAccount, value: amount, to: to });

        document.getElementById('status').innerHTML = `<p>Transaction successful. Tx Hash: ${result.transactionHash}</p>`;
        await updateFromAccount();
    } catch (error) {
        document.getElementById('status').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

async function updateFromAccount(){
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const fromAccount = accounts[0];
    document.getElementById("fromAccount").innerHTML = 'De: '+fromAccount;

    const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [fromAccount, 'latest']
    });
    document.getElementById('balance').innerHTML = `<p>Saldo Atual: ${Web3.utils.fromWei(balance, 'ether')} ETH</p>`;
}

async function main(){
    await updateFromAccount();
}

main();
