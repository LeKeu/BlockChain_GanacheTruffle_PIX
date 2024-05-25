import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import configuration from '../build/contracts/Migrations.json'

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;

if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}

const web3 = new Web3( Web3.givenProvider || 'http://127.0.0.1:7545' );
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

let account;

const accountEl = document.getElementById('account');

const main = async () => {
    try{
        //pega as contas do ganache
        //await window.ethereum.request({ method: 'eth_requestAccounts' });
        //const accounts = await web3.eth.getAccounts();
    
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        accounts.forEach((acc, index) => {
            console.log(`Account ${index + 1}: ${acc}`);
        });

        account = accounts[0];
        accountEl.innerText = account;
    } catch (error){
        console.error('User denied account access', error);
    }
    
}

main();