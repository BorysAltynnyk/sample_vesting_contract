// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "./Tokens.sol";

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

    constructor() {
        owner = msg.sender;
        vestingPeriod = 5 days;
        numberOfPeriods = 5;
        token = new AbramisBrama("AbramisBrama", "ABR");
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

    // TODO amount to share has to be multiple of vestingPeriod
    function addRecipient(uint256 _amountToShare, address _recipient) external onlyOwner{
        require (_amountToShare <= token.balanceOf(address(this)), 'Not enough tokens to share!');
        recipients[_recipient] = Recipient(block.timestamp, _amountToShare, 0);
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