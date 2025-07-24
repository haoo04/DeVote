// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract DeVote is Ownable, ReentrancyGuard, Pausable {
    // Voting Type Enumeration
    enum VoteType { SingleChoice, MultiChoice }
    
    // Voting status enumeration
    enum VoteStatus { Active, Ended, Cancelled }
    
    // Voting structure
    struct Vote {
        uint256 id;
        string title;
        string description;
        string[] options;
        uint256[] voteCounts;
        VoteType voteType;
        VoteStatus status;
        address creator;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVoters;
        bool isPrivate;
        mapping(address => bool) hasVoted;
        mapping(address => uint256[]) voterChoices;
        mapping(address => bool) allowedVoters;
    }
    
    // State variables
    mapping(uint256 => Vote) public votes;
    uint256 public voteCount;
    
    // Events
    event VoteCreated(
        uint256 indexed voteId,
        string title,
        address indexed creator,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed voteId,
        address indexed voter,
        uint256[] choices
    );
    
    event VoteEnded(uint256 indexed voteId);
    event VoteCancelled(uint256 indexed voteId);
    event EmergencyVoteCancelled(uint256 indexed voteId, string reason);
    
    // Custom modifiers
    modifier onlyVoteCreator(uint256 _voteId) {
        require(msg.sender == votes[_voteId].creator, "DeVote: only vote creator can call this function");
        _;
    }
    
    modifier voteExists(uint256 _voteId) {
        require(_voteId < voteCount, "DeVote: vote does not exist");
        _;
    }
    
    modifier voteActive(uint256 _voteId) {
        require(votes[_voteId].status == VoteStatus.Active, "DeVote: vote is not active");
        require(block.timestamp >= votes[_voteId].startTime, "DeVote: vote has not started yet");
        require(block.timestamp <= votes[_voteId].endTime, "DeVote: vote has ended");
        _;
    }
    
    // Constructor - Using the Ownable constructor
    constructor() Ownable(msg.sender) {
        voteCount = 0;
    }
    
    // Emergency pause function - Only the owner can pause the contract
    function pause() public onlyOwner {
        _pause();
    }
    
    // Emergency unpause function - Only the owner can resume the contract
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // Create Vote - Add nonReentrant and whenNotPaused protection
    function createVote(
        string memory _title,
        string memory _description,
        string[] memory _options,
        VoteType _voteType,
        uint256 _startTime,
        uint256 _endTime,
        bool _isPrivate,
        address[] memory _allowedVoters
    ) public nonReentrant whenNotPaused returns (uint256) {
        require(bytes(_title).length > 0, "DeVote: title cannot be empty");
        require(_options.length >= 2, "DeVote: at least 2 options required");
        require(_startTime < _endTime, "DeVote: invalid time range");
        require(_endTime > block.timestamp, "DeVote: end time must be in the future");
        
        uint256 voteId = voteCount++;
        Vote storage newVote = votes[voteId];
        
        newVote.id = voteId;
        newVote.title = _title;
        newVote.description = _description;
        newVote.options = _options;
        newVote.voteCounts = new uint256[](_options.length);
        newVote.voteType = _voteType;
        newVote.status = VoteStatus.Active;
        newVote.creator = msg.sender;
        newVote.startTime = _startTime;
        newVote.endTime = _endTime;
        newVote.totalVoters = 0;
        newVote.isPrivate = _isPrivate;
        
        // If it's a private vote, set allowed voters
        if (_isPrivate) {
            for (uint256 i = 0; i < _allowedVoters.length; i++) {
                newVote.allowedVoters[_allowedVoters[i]] = true;
            }
        }
        
        emit VoteCreated(voteId, _title, msg.sender, _startTime, _endTime);
        return voteId;
    }
    
    // Vote - Add nonReentrant and whenNotPaused protection
    function castVote(uint256 _voteId, uint256[] memory _choices) 
        public 
        nonReentrant 
        whenNotPaused
        voteExists(_voteId) 
        voteActive(_voteId) 
    {
        Vote storage vote = votes[_voteId];
        
        require(!vote.hasVoted[msg.sender], "DeVote: already voted");
        require(_choices.length > 0, "DeVote: must select at least one option");
        
        // Check private vote permissions
        if (vote.isPrivate) {
            require(vote.allowedVoters[msg.sender], "DeVote: not authorized to vote");
        }
        
        // Check the validity of the selected options
        for (uint256 i = 0; i < _choices.length; i++) {
            require(_choices[i] < vote.options.length, "DeVote: invalid option");
        }
        
        // Single choice voting allows only one option
        if (vote.voteType == VoteType.SingleChoice) {
            require(_choices.length == 1, "DeVote: single choice vote allows only one option");
        }
        
        // Record the vote
        vote.hasVoted[msg.sender] = true;
        vote.voterChoices[msg.sender] = _choices;
        vote.totalVoters++;
        
        // Update the vote count
        for (uint256 i = 0; i < _choices.length; i++) {
            vote.voteCounts[_choices[i]]++;
        }
        
        emit VoteCast(_voteId, msg.sender, _choices);
    }
    
    // End Vote - Add nonReentrant protection
    function endVote(uint256 _voteId) 
        public 
        nonReentrant
        voteExists(_voteId) 
        onlyVoteCreator(_voteId) 
    {
        Vote storage vote = votes[_voteId];
        require(vote.status == VoteStatus.Active, "DeVote: vote is not active");
        
        vote.status = VoteStatus.Ended;
        emit VoteEnded(_voteId);
    }
    
    // Cancel Vote - Add nonReentrant protection
    function cancelVote(uint256 _voteId) 
        public 
        nonReentrant
        voteExists(_voteId) 
        onlyVoteCreator(_voteId) 
    {
        Vote storage vote = votes[_voteId];
        require(vote.status == VoteStatus.Active, "DeVote: vote is not active");
        
        vote.status = VoteStatus.Cancelled;
        emit VoteCancelled(_voteId);
    }
    
    // Get Vote Basic Information
    function getVoteInfo(uint256 _voteId) 
        public 
        view 
        voteExists(_voteId) 
        returns (
            uint256 id,
            string memory title,
            string memory description,
            string[] memory options,
            VoteType voteType,
            VoteStatus status,
            address creator,
            uint256 startTime,
            uint256 endTime,
            uint256 totalVoters,
            bool isPrivate
        ) 
    {
        Vote storage vote = votes[_voteId];
        return (
            vote.id,
            vote.title,
            vote.description,
            vote.options,
            vote.voteType,
            vote.status,
            vote.creator,
            vote.startTime,
            vote.endTime,
            vote.totalVoters,
            vote.isPrivate
        );
    }
    
    // Get Vote Results
    function getVoteResults(uint256 _voteId) 
        public 
        view 
        voteExists(_voteId) 
        returns (uint256[] memory) 
    {
        return votes[_voteId].voteCounts;
    }
    
    // Check if the user has voted
    function hasUserVoted(uint256 _voteId, address _user) 
        public 
        view 
        voteExists(_voteId) 
        returns (bool) 
    {
        return votes[_voteId].hasVoted[_user];
    }
    
    // Get the user's vote choices
    function getUserVoteChoices(uint256 _voteId, address _user) 
        public 
        view 
        voteExists(_voteId) 
        returns (uint256[] memory) 
    {
        require(votes[_voteId].hasVoted[_user], "DeVote: user has not voted");
        return votes[_voteId].voterChoices[_user];
    }
    
    // Check if the user has voting permissions
    function canUserVote(uint256 _voteId, address _user) 
        public 
        view 
        voteExists(_voteId) 
        returns (bool) 
    {
        Vote storage vote = votes[_voteId];
        
        // Check if the vote is active
        if (vote.status != VoteStatus.Active) return false;
        if (block.timestamp < vote.startTime) return false;
        if (block.timestamp > vote.endTime) return false;
        
        // Check if the user has voted
        if (vote.hasVoted[_user]) return false;
        
        // Check private vote permissions
        if (vote.isPrivate) {
            return vote.allowedVoters[_user];
        }
        
        return true;
    }
    
    // Get all vote ID lists
    function getAllVoteIds() public view whenNotPaused returns (uint256[] memory) {
        uint256[] memory voteIds = new uint256[](voteCount);
        for (uint256 i = 0; i < voteCount; i++) {
            voteIds[i] = i;
        }
        return voteIds;
    }
    
    // Get the user's created vote ID list
    function getUserCreatedVotes(address _user) public view whenNotPaused returns (uint256[] memory) {
        require(_user != address(0), "DeVote: invalid user address");
        
        uint256[] memory tempVoteIds = new uint256[](voteCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < voteCount; i++) {
            if (votes[i].creator == _user) {
                tempVoteIds[count] = i;
                count++;
            }
        }
        
        uint256[] memory userVoteIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            userVoteIds[i] = tempVoteIds[i];
        }
        
        return userVoteIds;
    }
    
    // Get the user's participated vote ID list
    function getUserParticipatedVotes(address _user) public view whenNotPaused returns (uint256[] memory) {
        require(_user != address(0), "DeVote: invalid user address");
        
        uint256[] memory tempVoteIds = new uint256[](voteCount);
        uint256 count = 0;
        
        for (uint256 i = 0; i < voteCount; i++) {
            if (votes[i].hasVoted[_user]) {
                tempVoteIds[count] = i;
                count++;
            }
        }
        
        uint256[] memory userVoteIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            userVoteIds[i] = tempVoteIds[i];
        }
        
        return userVoteIds;
    }
    
    // Automatically end expired votes - Add permission control and reentrancy protection
    function autoEndExpiredVotes() public nonReentrant onlyOwner {
        for (uint256 i = 0; i < voteCount; i++) {
            if (votes[i].status == VoteStatus.Active && block.timestamp > votes[i].endTime) {
                votes[i].status = VoteStatus.Ended;
                emit VoteEnded(i);
            }
        }
    }
    
    // Add a batch end expired vote security version (anyone can call)
    function batchEndExpiredVotes(uint256[] calldata _voteIds) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(_voteIds.length > 0, "DeVote: empty vote IDs array");
        require(_voteIds.length <= 100, "DeVote: too many votes to process at once");
        
        for (uint256 i = 0; i < _voteIds.length; i++) {
            uint256 voteId = _voteIds[i];
            if (voteId < voteCount) {
                Vote storage vote = votes[voteId];
                if (vote.status == VoteStatus.Active && block.timestamp > vote.endTime) {
                    vote.status = VoteStatus.Ended;
                    emit VoteEnded(voteId);
                }
            }
        }
    }
    
    // Add emergency cancel vote function (only owner)
    function emergencyCancelVote(uint256 _voteId, string calldata _reason) 
        external 
        onlyOwner 
        nonReentrant
        voteExists(_voteId) 
    {
        Vote storage vote = votes[_voteId];
        require(vote.status == VoteStatus.Active, "DeVote: vote is not active");
        require(bytes(_reason).length > 0, "DeVote: reason cannot be empty");
        
        vote.status = VoteStatus.Cancelled;
        emit VoteCancelled(_voteId);
        emit EmergencyVoteCancelled(_voteId, _reason);
    }
} 