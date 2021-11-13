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
        uint256 nRecivedPayment;
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

    function getVestingPeriod() public view returns (uint256) {
        return vestingPeriod;
    }

    // TODO amount to share has to be multiple of vestingPeriod
    function addRecipient(uint256 _amountToShare, address _recipient) external onlyOwner{
        require (_amountToShare <= token.balanceOf(address(this)), 'Not enough fish to share!');
        recipients[_recipient] = Recipient(block.timestamp, _amountToShare, 0);
    }    

    function claim() external {
        Recipient memory r = recipients[msg.sender];
        require(r.nRecivedPayment < numberOfPeriods, "All payments are paid");

        if ((r.vestingStartDate + r.nRecivedPayment * vestingPeriod ) >= block.timestamp ){
            uint256 _timePassed = block.timestamp - (r.vestingStartDate + r.nRecivedPayment * vestingPeriod);
            uint256 _newPeriods = _timePassed % vestingPeriod - r.nRecivedPayment;
            r.nRecivedPayment += _newPeriods;
            token.transfer(msg.sender, _newPeriods * r.totalTokensToShare / numberOfPeriods);
        }
    }
}