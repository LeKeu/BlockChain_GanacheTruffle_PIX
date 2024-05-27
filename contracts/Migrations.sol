// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Migrations {
    struct Transaction {
        address from;
        address to;
        uint256 amount;
    }

    struct User {
        uint256 balance;
        bool exists;
        uint256 transactionCount; // Contador de transações do usuário
    }

    mapping(address => User) private users;
    mapping(address => mapping(uint256 => Transaction)) private userTransactions;

    event UserRegistered(address indexed user);
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    event Payment(address indexed from, address indexed to, uint256 amount);

    modifier onlyRegistered() {
        require(users[msg.sender].exists, "User not registered");
        _;
    }

    function registerUser() external {
        require(!users[msg.sender].exists, "User already registered");
        users[msg.sender].exists = true;
        emit UserRegistered(msg.sender);
    }

    function deposit() external payable onlyRegistered {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        users[msg.sender].balance += msg.value;

        uint256 txCount = users[msg.sender].transactionCount;
        userTransactions[msg.sender][txCount] = Transaction({
            from: address(0),
            to: msg.sender,
            amount: msg.value
        });
        users[msg.sender].transactionCount++;

        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external onlyRegistered {
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);

        uint256 txCount = users[msg.sender].transactionCount;
        userTransactions[msg.sender][txCount] = Transaction({
            from: msg.sender,
            to: address(0),
            amount: amount
        });
        users[msg.sender].transactionCount++;

        emit Withdrawal(msg.sender, amount);
    }

    function sendPayment(address from, address to, uint256 amount) external onlyRegistered {
        require(users[from].exists, "Sender not registered");
        require(users[to].exists, "Recipient not registered");
        require(users[from].balance >= amount, "Insufficient balance");

        users[from].balance -= amount;
        users[to].balance += amount;

        uint256 txCountFrom = users[from].transactionCount;
        userTransactions[from][txCountFrom] = Transaction({
            from: from,
            to: to,
            amount: amount
        });
        users[from].transactionCount++;

        uint256 txCountTo = users[to].transactionCount;
        userTransactions[to][txCountTo] = Transaction({
            from: from,
            to: to,
            amount: amount
        });
        users[to].transactionCount++;

        emit Payment(from, to, amount);
    }

    function getBalance() external view onlyRegistered returns (uint256) {
        return users[msg.sender].balance;
    }

    function isRegistered(address user) external view returns (bool) {
        return users[user].exists;
    }

    function getTransactionCount(address user) external view returns (uint256) {
        return users[user].transactionCount;
    }

    function getTransaction(address user, uint256 index) external view returns (address, address, uint256) {
        require(index < users[user].transactionCount, "Invalid index");
        Transaction memory transaction = userTransactions[user][index];
        return (transaction.from, transaction.to, transaction.amount);
    }

    function getAllTransactions(address user) external view returns (Transaction[] memory) {
        uint256 transactionCount = users[user].transactionCount;
        Transaction[] memory transactions = new Transaction[](transactionCount);
        for (uint256 i = 0; i < transactionCount; i++) {
            transactions[i] = userTransactions[user][i];
        }
        return transactions;
    }

    function setCompleted(uint completed) external {
        // Implemente a lógica necessária para marcar a migração como concluída aqui
    }
}
