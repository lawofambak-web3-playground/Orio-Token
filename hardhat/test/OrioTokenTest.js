const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("OrioToken contract", function () {

  let OrioToken;
  let orioToken;
  let owner;
  let account1;
  let account2;
  let account3;

  beforeEach(async function () {
    OrioToken = await ethers.getContractFactory("OrioToken");
    [owner, account1, account2, account3] = await ethers.getSigners();
    orioToken = await OrioToken.deploy();
    await orioToken.deployed();
  });

  describe("Deployment", function () {
    it("Should set correct owner", async function () {
      const ownerAddress = await orioToken.owner();

      expect(ownerAddress).to.equal(owner.address);
    });

    it("Should return Orio Token as token name", async function () {
      const tokenName = await orioToken.name();

      expect(tokenName).to.equal("Orio Token");
    });

    it("Should return ORIO as token symbol", async function () {
      const tokenSymbol = await orioToken.symbol();

      expect(tokenSymbol).to.equal("ORIO");
    });

    it("Should return 18 as decimals", async function () {
      const decimals = await orioToken.decimals();

      expect(decimals).to.equal(18);
    });

    it("Should return 1000 tokens as total supply", async function () {
      let totalSupply = await orioToken.totalSupply();
      totalSupply = totalSupply / 10 ** 18;

      expect(totalSupply).to.equal(1000);
    });

    it("Should assign total supply to owner", async function () {
      const ownerBalance = await orioToken.balanceOf(owner.address);
      const totalSupply = await orioToken.totalSupply();

      expect(ownerBalance).to.equal(totalSupply);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens to another account", async function () {
      const amountToTransfer = 100 * 10 ** 18;

      await orioToken.transfer(account1.address, BigNumber.from(amountToTransfer.toString()));

      const account1Balance = await orioToken.balanceOf(account1.address);

      expect(account1Balance).to.equal(BigNumber.from(amountToTransfer.toString()));
    });

    it("Transaction should fail if sender doesn't have enough tokens", async function () {
      const ownerBalance = await orioToken.balanceOf(owner.address);

      const amountToTransfer = 5 * 10 ** 18;

      await expect(
        orioToken.connect(account1).transfer(owner.address, BigNumber.from(amountToTransfer.toString()))
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await orioToken.balanceOf(owner.address)).to.equal(
        ownerBalance
      );
    });

    it("Balances should update after transfers", async function () {
      const initialOwnerBalance = await orioToken.balanceOf(owner.address);
      const amountToTransfer1 = 20 * 10 ** 18;
      const amountToTransfer2 = 10 * 10 ** 18;
      const totalTransferAmount = amountToTransfer1 + amountToTransfer2;

      await orioToken.transfer(account1.address, BigNumber.from(amountToTransfer1.toString()));

      await orioToken.transfer(account2.address, BigNumber.from(amountToTransfer2.toString()));

      const finalOwnerBalance = await orioToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(BigNumber.from(totalTransferAmount.toString())));

      const account1Balance = await orioToken.balanceOf(account1.address);
      expect(account1Balance).to.equal(BigNumber.from(amountToTransfer1.toString()));

      const account2Balance = await orioToken.balanceOf(account2.address);
      expect(account2Balance).to.equal(BigNumber.from(amountToTransfer2.toString()));
    });

    it("Approves tokens for delegated transfer", async function () {
      const amountToApprove = 15 * 10 ** 18;

      await orioToken.connect(account1).approve(account2.address, BigNumber.from(amountToApprove.toString()));

      expect(await orioToken.allowance(account1.address, account2.address)).to.equal(
        BigNumber.from(amountToApprove.toString())
      );
    });

    it("Executes delegated transfer between accounts", async function () {
      let fromAccount = account1;
      let toAccount = account2;
      let spendingAccount = account3;
      const amountToTransfer = 50 * 10 ** 18;
      const initialAllowance = 20 * 10 ** 18;
      const bigAllowanceAmount = 100 * 10 ** 18;
      const correctAllowanceAmount = 10 * 10 ** 18;
      const fromAccFinalBalance = 40 * 10 ** 18;
      const toAccFinalBalance = 10 * 10 ** 18;
      const finalAllowance = 10 * 10 ** 18;

      await orioToken.transfer(fromAccount.address, BigNumber.from(amountToTransfer.toString()));

      await orioToken.connect(fromAccount).approve(spendingAccount.address, BigNumber.from(initialAllowance.toString()));

      await expect(
        orioToken.transferFrom(fromAccount.address, toAccount.address, BigNumber.from(bigAllowanceAmount.toString()))
      ).to.be.revertedWith("ERC20: insufficient allowance");

      await orioToken.connect(spendingAccount).transferFrom(fromAccount.address, toAccount.address, BigNumber.from(correctAllowanceAmount.toString()));

      expect(await orioToken.balanceOf(fromAccount.address)).to.equal(
        BigNumber.from(fromAccFinalBalance.toString())
      );

      expect(await orioToken.balanceOf(toAccount.address)).to.equal(
        BigNumber.from(toAccFinalBalance.toString())
      );

      expect(await orioToken.allowance(fromAccount.address, spendingAccount.address)).to.equal(
        BigNumber.from(finalAllowance.toString())
      );
    });

  });

});
