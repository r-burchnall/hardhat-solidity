import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Token contract", function () {
    // Helper function which will be used in fixtures
  async function deployTokenFixture() {
    // A Signer represents an ethereum account
    const [owner, addr1, addr2] = await ethers.getSigners();

    // Contract factory is an abstraction that will deploy a new contract
    const tokenFactory = await ethers.getContractFactory("Token");

    // When we call deploy on our contractFactory, we get a promise which deploys to the network. This will resolve to a contract
    const tokenContract = await tokenFactory.deploy();

    // Fixtures can return anything you consider useful for your tests
    return { tokenFactory, tokenContract, owner, addr1, addr2 };
  }

  it("Deployment should assign the total supply of tokens to the owner", async function () {
    // Fixtures are only executed once per test suite run.
    const { tokenContract, owner } = await loadFixture(deployTokenFixture);

    // Because we've compiled, we have typing for this contract.
    // We are able to call functions from this contract. Such as;
    // balanceOf which is a 'external' 'view' function within our contract.
    const ownerBalance = await tokenContract.balanceOf(owner.address);
    expect(await tokenContract.totalSupply()).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async function () {
    const { tokenContract, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    // Transfer 50 tokens from owner to addr1
    await tokenContract.transfer(addr1.address, 50);
    expect(await tokenContract.balanceOf(addr1.address)).to.equal(50);

    // Transfer 50 tokens from addr1 to addr2
    await tokenContract.connect(addr1).transfer(addr2.address, 50);
    expect(await tokenContract.balanceOf(addr1.address)).to.equal(0);
    expect(await tokenContract.balanceOf(addr2.address)).to.equal(50);
  });

  it("should emit Transfer events", async function () {
    const { tokenContract, owner, addr1, addr2 } = await loadFixture(
      deployTokenFixture
    );

    // Transfer 50 tokens from owner to addr1
    await expect(tokenContract.transfer(addr1.address, 50))
      .to.emit(tokenContract, "Transfer")
      .withArgs(owner.address, addr1.address, 50);

    // Transfer 50 tokens from addr1 to addr2
    // We use .connect(signer) to send a transaction from another account
    await expect(tokenContract.connect(addr1).transfer(addr2.address, 50))
      .to.emit(tokenContract, "Transfer")
      .withArgs(addr1.address, addr2.address, 50);
  });

  it("Should fail if sender doesn't have enough tokens", async function () {
    const { tokenContract, owner, addr1 } = await loadFixture(
      deployTokenFixture
    );
    const initialOwnerBalance = await tokenContract.balanceOf(owner.address);

    // Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
    // `require` will evaluate false and revert the transaction.
    await expect(
      tokenContract.connect(addr1).transfer(owner.address, 1)
    ).to.be.revertedWith("Not enough tokens");

    // Owner balance shouldn't have changed.
    expect(await tokenContract.balanceOf(owner.address)).to.equal(
      initialOwnerBalance
    );
  });
});
