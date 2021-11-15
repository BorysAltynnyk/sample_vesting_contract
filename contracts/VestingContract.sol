// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Tokens.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";



/// @title PortionalVesting
contract VestingContract {
    
    AbramisBrama public token;

    address public owner;
    uint256 public vestingPeriod;
    uint256 public numberOfPeriods;
    
    mapping (address => Recipient) public recipients;
    
    struct Recipient{
        uint256 vestingStartDate;
        uint256 totalTokensToShare;
        uint256 tokensClaimed;
    }

    constructor(uint256 _vestingPeriod, uint _numberOfPeriods, uint256 _totalTokensCount) {
        owner = msg.sender;
        vestingPeriod = _vestingPeriod;
        numberOfPeriods = _numberOfPeriods;
        token = new AbramisBrama("AbramisBrama", "ABR", _totalTokensCount);
    }

    modifier onlyOwner() {
    require(owner == msg.sender, "Only owner can call this function");
    _;
    }

    function getVestingPeriod() public view returns (uint256){
        return vestingPeriod;
    }

    function getTokenBalance(address _address) public view returns (uint256){
        return token.balanceOf(_address);
    }
    

    function setVestingPeriod(uint256 _vestingPeriod) external onlyOwner {
        vestingPeriod = _vestingPeriod;
    }

    function addRecipient(uint256 _amountToShare, address _recipient) external onlyOwner{
        require (_amountToShare * 10**uint256(18) <= token.balanceOf(address(this)), 'Not enough tokens to share!');
        
        recipients[_recipient] = Recipient(block.timestamp, _amountToShare * 10**uint256(18), 0);
    }    

    function claim() external {
        Recipient storage r = recipients[msg.sender];

        require(r.tokensClaimed < r.totalTokensToShare, "All payments are paid");

        uint256 _timeDiff = block.timestamp - r.vestingStartDate;
        uint256 transhesToShare = _timeDiff / vestingPeriod;
        if (transhesToShare > numberOfPeriods) {
            transhesToShare = 5;
        }

        uint256 tokensToTransfer = transhesToShare * (r.totalTokensToShare/numberOfPeriods);
        tokensToTransfer = (tokensToTransfer - r.tokensClaimed);
        
        token.transfer(msg.sender, tokensToTransfer);
        r.tokensClaimed = r.tokensClaimed + tokensToTransfer;
    }
}