//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error ownersonly();

contract DAOToken is ERC20 {
    address public DAO;
    address public owner;

    constructor() ERC20("DAOToken", "DAO") {
        owner = msg.sender;
    }

    function setDAOaddress(address _input) public {
        if ((msg.sender != owner) && (msg.sender != DAO)) revert ownersonly();
        DAO = _input;
    }

    function mint(address _account, uint256 _amount) public {
        if ((msg.sender != owner) && (msg.sender != DAO)) revert ownersonly();
        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) public {
        if ((msg.sender != owner) && (msg.sender != DAO)) revert ownersonly();
        _burn(_account, _amount);
    }

    function _transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public {
        if ((msg.sender != owner) && (msg.sender != DAO)) revert ownersonly();
        transferFrom(_from, _to, _amount);
    }

    function _transfer(address _to, uint256 _amount) public {
        if ((msg.sender != owner) && (msg.sender != DAO)) revert ownersonly();
        transfer(_to, _amount);
    }
}
