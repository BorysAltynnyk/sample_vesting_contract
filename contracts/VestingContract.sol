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
        uint256 nReceivedPayment;
    }

    constructor() {
        owner = msg.sender;
        vestingPeriod = 5 days;
        numberOfPeriods = 5;
        token = new AbramisBrama("AbramisBrama", "ABR");
    }

    modifier onlyOwner() {
    require(owner == msg.sender, "Only owner can run this function");
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
        require (_amountToShare <= token.balanceOf(address(this)), 'Not enough fish to share!');
        recipients[_recipient] = Recipient(block.timestamp, _amountToShare, 0);
    }    

    function claim() external {
        Recipient storage r = recipients[msg.sender];
        require(r.nReceivedPayment < numberOfPeriods, "All payments are paid");
        uint256 _timePassed = block.timestamp - (r.vestingStartDate + r.nReceivedPayment * vestingPeriod);
        uint256 _newPeriods = _timePassed / vestingPeriod - r.nReceivedPayment;
        // token.transfer(msg.sender, 40);
        if (_newPeriods > 0 && _newPeriods < numberOfPeriods - r.nReceivedPayment ){
            r.nReceivedPayment += _newPeriods;
            token.transfer(msg.sender, _newPeriods * 20);
       }else {
           token.transfer(msg.sender, (numberOfPeriods - r.nReceivedPayment) * 20);
       }

    }
}