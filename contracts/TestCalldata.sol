//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.14;

import "hardhat/console.sol";

contract TestCalldata {
    event status(uint256 _temp);

    uint256 public temporary;

    function updatevalueoftemp() public returns (uint256) {
        temporary += 100;
        emit status(temporary);
        return temporary;
    }
}

// For reference
// call data 0xfd445e19 for updatevalueoftemp()
