const Migrations = artifacts.require("Migrations");
const assert = require("assert");

contract("Migrations", (accounts) => {
    let instance;
    const [owner, user1, user2] = accounts;

    before(async () => {
        instance = await Migrations.deployed();
    });

    it("should register a new user", async () => {
        await instance.registerUser({ from: user1 });
        const isRegistered = await instance.isRegistered(user1);
        assert.strictEqual(isRegistered, true, "User should be registered");
    });

    it("should allow a user to deposit funds", async () => {
        const depositAmount = web3.utils.toWei("1", "ether");
        await instance.deposit({ from: user1, value: depositAmount });
        const balance = await instance.getBalance({ from: user1 });
        assert.strictEqual(balance.toString(), depositAmount, "Balance should match deposit amount");
    });

    it("should allow a user to withdraw funds", async () => {
        const initialBalance = await web3.eth.getBalance(user1);
        const withdrawAmount = web3.utils.toWei("0.5", "ether");
        await instance.withdraw(withdrawAmount, { from: user1 });
        const balance = await instance.getBalance({ from: user1 });
        const expectedBalance = web3.utils.toWei("0.5", "ether");
        assert.strictEqual(balance.toString(), expectedBalance, "Balance should be reduced after withdrawal");

        const finalBalance = await web3.eth.getBalance(user1);
        assert(parseFloat(finalBalance) > parseFloat(initialBalance), "User balance should increase after withdrawal");
    });

    it("should allow a user to send a payment to another user", async () => {
        await instance.registerUser({ from: user2 });
        const paymentAmount = web3.utils.toWei("0.25", "ether");
        await instance.sendPayment(user1, user2, paymentAmount, { from: user1 }); // Modified to include "from" account
        const balance1 = await instance.getBalance({ from: user1 });
        const balance2 = await instance.getBalance({ from: user2 });

        const expectedBalance1 = web3.utils.toWei("0.25", "ether");
        assert.strictEqual(balance1.toString(), expectedBalance1, "Sender's balance should decrease by payment amount");

        assert.strictEqual(balance2.toString(), paymentAmount, "Recipient's balance should increase by payment amount");
    });
});
