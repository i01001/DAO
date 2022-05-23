//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.14;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DAOToken.sol";
import "hardhat/console.sol";

/// @dev All error codes generated within the contract
error approvalForDAOreq();
error waitforProposalEnd(uint256);
error amountGreaterthanBalance(uint256, uint256);
error proposalClosed();
error insufficentVotingPower();
error alreadyVoted();
error needtoendProposal(uint256);
error waitforProposalEndTime(uint256);
error errorCallingFunction(string);
error proposalIDdoesnotexist();
error onlyChairPerson();
error noVotes();

/// @title DAO Project Contract for submitting proposals, voting it and executing functions within other contract based on proposals 
/// @author Ikhlas
/// @notice The contract does not have the front end implemented
/// @dev All function calls are currently implemented without side effects
/// @custom:experimental This is an experimental contract.
contract DAOProject {
    using Counters for Counters.Counter;

    /// @notice Allows users to create NFT,list them or auction them.
    /// @dev Additional features can be added such as batch minting
    /// @notice Counters are used for couting the listed items, sold, auction items and sold respectively.
    address public chairPerson;
    address public voteToken;
    uint256 public minimumQuorum;
    uint256 public debatingPeriodDuration;
    uint256 public totalVotingPower;

    Counters.Counter public proposalID;

    struct proposal {
        uint256 id;
        proposalStatus status;
        uint256 FORvotes;
        uint256 AGAINSTvotes;
        uint256 startTime;
        bytes callData;
        address recipient;
        string description;
    }

    struct voter {
        uint256 votingPower;
        uint256 endTime;
        uint256 endingProposalID;
        mapping(uint256 => bool) voted;
    }

    enum proposalStatus {
        NONE,
        INPROGRESS,
        APPROVED,
        REJECTED
    }

    mapping(uint256 => proposal) public Proposal;
    mapping(address => voter) public Voter;

    event percentage(uint256 _percentq, uint256 _percentfor);

    constructor(
        address _chairPerson,
        address _voteToken,
        uint256 _minimumQuorum,
        uint256 _debatingPeriodDuration
    ) {
        chairPerson = _chairPerson;
        voteToken = _voteToken;
        minimumQuorum = _minimumQuorum;
        debatingPeriodDuration = _debatingPeriodDuration;
    }

    function deposit(uint256 _amount) public {
        try
            DAOToken(voteToken)._transferFrom(
                msg.sender,
                address(this),
                _amount
            )
        {
            Voter[msg.sender].votingPower += _amount;
            totalVotingPower += _amount;
        } catch {
            revert approvalForDAOreq();
        }
    }

    function withdraw(uint256 _amount) public {
        if (_amount > Voter[msg.sender].votingPower)
            revert amountGreaterthanBalance(
                _amount,
                Voter[msg.sender].votingPower
            );
        if (block.timestamp < Voter[msg.sender].endTime)
            revert waitforProposalEnd(Voter[msg.sender].endingProposalID);
        if (
            Proposal[Voter[msg.sender].endingProposalID].status ==
            proposalStatus.INPROGRESS
        ) revert needtoendProposal(Voter[msg.sender].endingProposalID);
        Voter[msg.sender].votingPower -= _amount;
        totalVotingPower -= _amount;
        DAOToken(voteToken)._transfer(msg.sender, _amount);
    }

    function newProposal(
        bytes calldata _callData,
        address _recipient,
        string calldata _description
    ) public {
        if (msg.sender != chairPerson) revert onlyChairPerson();
        proposalID.increment();
        Proposal[proposalID.current()] = proposal(
            proposalID.current(),
            proposalStatus.INPROGRESS,
            0,
            0,
            block.timestamp,
            _callData,
            _recipient,
            _description
        );
    }

    function voting(
        uint256 _proposalID,
        uint256 _amount,
        bool _votefor
    ) public {
        if (_proposalID > proposalID.current()) revert proposalIDdoesnotexist();
        if (Proposal[_proposalID].status != proposalStatus.INPROGRESS)
            revert proposalClosed();
        if (_amount > Voter[msg.sender].votingPower)
            revert insufficentVotingPower();
        if (Voter[msg.sender].voted[_proposalID]) revert alreadyVoted();

        Voter[msg.sender].endingProposalID = _proposalID;
        Voter[msg.sender].endTime =
            Proposal[_proposalID].startTime +
            debatingPeriodDuration;
        Voter[msg.sender].voted[_proposalID] = true;
        if (_votefor) Proposal[_proposalID].FORvotes += _amount;
        else {
            Proposal[_proposalID].AGAINSTvotes += _amount;
        }
    }

    function endProposal(uint256 _proposalID) public {
        if (_proposalID > proposalID.current()) revert proposalIDdoesnotexist();
        if (Proposal[_proposalID].status != proposalStatus.INPROGRESS)
            revert proposalClosed();
        if (
            block.timestamp <
            (Proposal[_proposalID].startTime + debatingPeriodDuration)
        )
            revert waitforProposalEndTime(
                Proposal[_proposalID].startTime + debatingPeriodDuration
            );
        if (
            (Proposal[_proposalID].FORvotes +
                Proposal[_proposalID].AGAINSTvotes) != 0
        ) {
            uint256 percentQ = ((Proposal[_proposalID].FORvotes +
                Proposal[_proposalID].AGAINSTvotes) * 100) / (totalVotingPower);
            uint256 percentFor = ((Proposal[_proposalID].FORvotes) * 100) /
                (Proposal[_proposalID].FORvotes +
                    Proposal[_proposalID].AGAINSTvotes);
            emit percentage(percentQ, percentFor);
            if ((percentQ >= minimumQuorum) && (percentFor > 50)) {
                Proposal[_proposalID].status = proposalStatus.APPROVED;
                (bool success, ) = (Proposal[_proposalID].recipient).call(
                    Proposal[_proposalID].callData
                );
                if (!success)
                    revert errorCallingFunction(
                        Proposal[_proposalID].description
                    );
            } else Proposal[_proposalID].status = proposalStatus.REJECTED;
        } else Proposal[_proposalID].status = proposalStatus.REJECTED;
    }
}
