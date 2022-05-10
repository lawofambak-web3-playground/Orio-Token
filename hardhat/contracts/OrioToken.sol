// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Inheriting from OpenZeppelin ERC20 Contract
contract OrioToken is ERC20 {
    address public owner;

    // Also calling ERC20 constructor
    constructor() ERC20("Orio Token", "ORIO") {
        // Assign owner address
        owner = msg.sender;
        // Assign to total supply to owner
        _mint(owner, 1000 * 10**18);
    }
}
