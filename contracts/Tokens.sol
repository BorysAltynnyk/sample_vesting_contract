// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract AbramisBrama is ERC20 {   
    constructor(string memory name, string memory symbol, uint256 tokensCount) ERC20(name, symbol) {
        _mint(msg.sender, tokensCount * 10**uint256(decimals()));
    }
}