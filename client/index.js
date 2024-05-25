import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import configuration from '../build/contracts/Migrations.json'
import PokPixIMG from './images/PokPix.png';

const createElementFromString = (string) => {
    const el = document.createElement('div');
    el.innerHTML = string;
    return el.firstChild;
};

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

if (typeof window.ethereum !== 'undefined') {
    console.log('MetaMask is installed!');
}

const web3 = new Web3( Web3.givenProvider || 'http://127.0.0.1:7545' );
const contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

let account;

const accountEl = document.getElementById('account');
const accountsDIV = document.getElementById('accountsDIV');

const createRequest = async (user, amount, message) => {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        await contract.methods.createRequest(user, amount, message).send({ from: accounts[0] });
  
        console.log('Request created successfully!');
    } catch (error) {
        console.error('Error creating request:', error);
    }
};
  

const refreshAccounts = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    accountsDIV.innerHTML = '';

    accounts.forEach((acc, index) => {
        console.log(`Account ${index + 1}: ${acc}`);
        const nemsei = createElementFromString(
            `<div class="ticket card" style="width: 18rem;">
              <div class="card-body">
                <h5 class="card-title">Account ${index + 1}: ${acc}</h5>
                <p class="card-text">Eth</p>
                <button class="btn btn-primary" onclick="">Criar Pedido</button>
                <button class="btn btn-primary">Pagar Pedido</button>
              </div>
            </div>`
          );
        accountsDIV.appendChild(nemsei);
    });
}

const main = async () => {
    try{
        //pega as contas do ganache
        //await window.ethereum.request({ method: 'eth_requestAccounts' });
        //const accounts = await web3.eth.getAccounts();
    
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        account = accounts[0];
        accountEl.innerText = account;

        refreshAccounts();
    } catch (error){
        console.error('User denied account access', error);
    }
    
}

main();