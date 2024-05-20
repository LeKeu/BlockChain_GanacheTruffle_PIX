const Migrations = artifacts.require("Migrations");
const assert = require("assert");

contract("Migrations", (accounts) => {
  const OWNER = accounts[0];
  const USER = accounts[1];
  const RECIPIENT = accounts[2];

  let instance;

  before(async () => {
    instance = await Migrations.deployed();
  });

  it("should set the owner to the deployer", async () => {
    const owner = await instance.owner();
    assert.strictEqual(owner, OWNER, "The owner is not the deployer");
  });

  it("should add a name for a user", async () => {
    await instance.addName("Alice", { from: USER });
    const userName = await instance.getMyName(USER);
    assert.strictEqual(userName.name, "Alice", "The name was not added correctly");
    assert.strictEqual(userName.hasName, true, "The hasName flag was not set correctly");
  });

  it("should create a payment request", async () => {
    await instance.createRequest(RECIPIENT, web3.utils.toWei("1", "ether"), "Payment request", { from: USER });
    const requests = await instance.getMyRequest(RECIPIENT);
    assert.strictEqual(requests[0][0], USER, "The requestor address is incorrect");
    assert.strictEqual(web3.utils.fromWei(requests[1][0], "ether"), "1", "The amount is incorrect");
    assert.strictEqual(requests[2][0], "Payment request", "The message is incorrect");
    assert.strictEqual(requests[3][0], "Alice", "The name is incorrect");
  });

  it("should allow a user to pay a request", async () => {
    await instance.createRequest(RECIPIENT, web3.utils.toWei("1", "ether"), "Payment request", { from: USER });

    const requestIndex = 0;
    const requestAmount = web3.utils.toWei("1", "ether");

    // Pagando a solicitação
    await instance.payRequest(requestIndex, { from: RECIPIENT, value: requestAmount });
    const requests = await instance.getMyRequest(RECIPIENT);
    assert.strictEqual(requests[0].length, 0, "The request was not removed correctly");
  });

  it("should record the transaction history for both parties", async () => {
    await instance.createRequest(RECIPIENT, web3.utils.toWei("1", "ether"), "Payment request", { from: USER });

    const requestIndex = 0;
    const requestAmount = web3.utils.toWei("1", "ether");

    await instance.payRequest(requestIndex, { from: RECIPIENT, value: requestAmount });

    const senderHistory = await instance.getMyHistory(RECIPIENT);
    const receiverHistory = await instance.getMyHistory(USER);

    assert.strictEqual(senderHistory.length, 1, "Sender history length is incorrect");
    assert.strictEqual(receiverHistory.length, 1, "Receiver history length is incorrect");

    assert.strictEqual(senderHistory[0].action, "-", "Sender history action is incorrect");
    assert.strictEqual(web3.utils.fromWei(senderHistory[0].amount, "ether"), "1", "Sender history amount is incorrect");
    assert.strictEqual(senderHistory[0].message, "Payment request", "Sender history message is incorrect");
    assert.strictEqual(senderHistory[0].otherPartyAddress, USER, "Sender history other party address is incorrect");

    assert.strictEqual(receiverHistory[0].action, "+", "Receiver history action is incorrect");
    assert.strictEqual(web3.utils.fromWei(receiverHistory[0].amount, "ether"), "1", "Receiver history amount is incorrect");
    assert.strictEqual(receiverHistory[0].message, "Payment request", "Receiver history message is incorrect");
    assert.strictEqual(receiverHistory[0].otherPartyAddress, RECIPIENT, "Receiver history other party address is incorrect");
  });

  it("should not allow a non-owner to set completed migration", async () => {
    try {
      await instance.setCompleted(1, { from: USER });
      assert.fail("The function should have thrown an error");
    } catch (err) {
      assert(err.message.includes("This function is restricted to the contract's owner"), "Expected error message not received");
    }
  });

  it("should allow the owner to set completed migration", async () => {
    await instance.setCompleted(1, { from: OWNER });
    const lastCompletedMigration = await instance.last_completed_migration();
    assert.strictEqual(lastCompletedMigration.toNumber(), 1, "The completed migration was not set correctly");
  });
});
