// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./OrioToken.sol";

contract OrioTokenSale {
    address payable public admin;
    OrioToken orioToken;
    uint256 public tokensPerEth = 100;

    event BuyTokens(address buyer, uint256 amountOfEth, uint256 amountOfTokens);

    constructor(address tokenAddress) {
        // Assign admin payable address
        admin = payable(msg.sender);
        orioToken = OrioToken(tokenAddress);
    }

    // Allows users to buy tokens
    function buyTokens() public payable {
        // Makes sure users send at least some ETH
        require(msg.value > 0, "Need to send some ETH to buy tokens");

        // Calculating amount of tokens user will receive
        uint256 buyAmount = msg.value * tokensPerEth;

        // Makes sure this contract has enough tokens for the user to buy
        require(
            (orioToken.balanceOf(address(this)) >= buyAmount),
            "Not enough tokens in contract"
        );

        // Transfering tokens to user and checking if the transaction is successful
        bool sent = orioToken.transfer(msg.sender, buyAmount);
        require(sent, "Failed to transfer tokens to user");

        // Emit a buy event
        emit BuyTokens(msg.sender, msg.value, buyAmount);
    }

    // Allows admin to withdraw this contract's ETH balance
    function withdraw() public {
        // Makes sure the user withdrawing the balance is admin
        require(msg.sender == admin, "Only admin can withdraw");

        // Transferring contract's ETH balance to admin and checking if transaction is successful
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to send balance back to admin");
    }
}
