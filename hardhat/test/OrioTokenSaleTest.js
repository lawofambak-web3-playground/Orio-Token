const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { waffle } = require("hardhat");

describe("OrioTokenSale contract", function () {

    let OrioToken;
    let orioToken;
    let OrioTokenSale;
    let orioTokenSale;
    let admin;
    let account1;

    beforeEach(async function () {
        OrioToken = await ethers.getContractFactory("OrioToken");
        orioToken = await OrioToken.deploy();
        await orioToken.deployed();
        OrioTokenSale = await ethers.getContractFactory("OrioTokenSale");
        [admin, account1] = await ethers.getSigners();
        orioTokenSale = await OrioTokenSale.deploy(orioToken.address);
        await orioTokenSale.deployed();
    });

    describe("Deployment", async function () {
        it("Should set correct admin", async function () {
            const adminAddress = await orioTokenSale.admin();

            expect(adminAddress).to.equal(admin.address);
        });

        it("Should set correct tokensPerEth (price of token)", async function () {
            const tokensPerEth = await orioTokenSale.tokensPerEth();

            expect(tokensPerEth).to.equal(100);
        });
    });

    describe("Transaction", async function () {
        beforeEach(async function () {
            const amountToTransfer = 100 * 10 ** 18;

            await orioToken.transfer(orioTokenSale.address, BigNumber.from(amountToTransfer.toString()));
        });

        it("Contract should have correct balance of transferred tokens", async function () {
            const contractBalance = 100 * 10 ** 18;

            expect(await orioToken.balanceOf(orioTokenSale.address)).to.equal(
                BigNumber.from(contractBalance.toString())
            );
        });

        it("Transaction should fail if sender doesn't send some ETH", async function () {
            await expect(
                orioTokenSale.connect(account1).buyTokens({ value: 0 })
            ).to.be.revertedWith("Need to send some ETH to buy tokens");
        });

        it("Transaction should fail if contract balance is less than buy amount", async function () {
            await expect(
                orioTokenSale.connect(account1).buyTokens({ value: parseEther("2") })
            ).to.be.revertedWith("Not enough tokens in contract");
        });

        it("User should have correct token balance after purchase", async function () {
            await orioTokenSale.connect(account1).buyTokens({ value: parseEther("0.01") });

            const account1Balance = 1 * 10 ** 18;

            expect(await orioToken.balanceOf(account1.address)).to.equal(
                BigNumber.from(account1Balance.toString())
            );
        });

        it("Only admin should be able to withdraw from contract", async function () {
            await expect(
                orioTokenSale.connect(account1).withdraw()
            ).to.be.revertedWith("Only admin can withdraw");
        });

        it("Admin should be able to withdraw from contract", async function () {
            const adminAddress = await orioTokenSale.admin();
            const provider = waffle.provider;
            const initialAdminBalance = await provider.getBalance(adminAddress);

            await orioTokenSale.connect(account1).buyTokens({ value: parseEther("0.1") });
            await orioTokenSale.withdraw();

            const finalAdminBalance = await provider.getBalance(adminAddress)

            expect(finalAdminBalance).to.be.above(initialAdminBalance);
        });
    });

});