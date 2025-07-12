// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DeVote {
    // 投票类型枚举
    enum VoteType { SingleChoice, MultiChoice }
    
    // 投票状态枚举
    enum VoteStatus { Active, Ended, Cancelled }
    
    // 投票结构体
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
    
    // 状态变量
    mapping(uint256 => Vote) public votes;
    uint256 public voteCount;
    address public owner;
    
    // 事件
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
    
    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyVoteCreator(uint256 _voteId) {
        require(msg.sender == votes[_voteId].creator, "Only vote creator can call this function");
        _;
    }
    
    modifier voteExists(uint256 _voteId) {
        require(_voteId < voteCount, "Vote does not exist");
        _;
    }
    
    modifier voteActive(uint256 _voteId) {
        require(votes[_voteId].status == VoteStatus.Active, "Vote is not active");
        require(block.timestamp >= votes[_voteId].startTime, "Vote has not started yet");
        require(block.timestamp <= votes[_voteId].endTime, "Vote has ended");
        _;
    }
    
    // 构造函数
    constructor() {
        owner = msg.sender;
        voteCount = 0;
    }
    
    // 创建投票
    function createVote(
        string memory _title,
        string memory _description,
        string[] memory _options,
        VoteType _voteType,
        uint256 _startTime,
        uint256 _endTime,
        bool _isPrivate,
        address[] memory _allowedVoters
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(_options.length >= 2, "At least 2 options required");
        require(_startTime < _endTime, "Invalid time range");
        require(_endTime > block.timestamp, "End time must be in the future");
        
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
        
        // 如果是私有投票，设置允许的投票者
        if (_isPrivate) {
            for (uint256 i = 0; i < _allowedVoters.length; i++) {
                newVote.allowedVoters[_allowedVoters[i]] = true;
            }
        }
        
        emit VoteCreated(voteId, _title, msg.sender, _startTime, _endTime);
        return voteId;
    }
    
    // 投票
    function castVote(uint256 _voteId, uint256[] memory _choices) 
        public 
        voteExists(_voteId) 
        voteActive(_voteId) 
    {
        Vote storage vote = votes[_voteId];
        
        require(!vote.hasVoted[msg.sender], "Already voted");
        require(_choices.length > 0, "Must select at least one option");
        
        // 检查私有投票权限
        if (vote.isPrivate) {
            require(vote.allowedVoters[msg.sender], "Not authorized to vote");
        }
        
        // 检查选择的有效性
        for (uint256 i = 0; i < _choices.length; i++) {
            require(_choices[i] < vote.options.length, "Invalid option");
        }
        
        // 单选投票只能选择一个选项
        if (vote.voteType == VoteType.SingleChoice) {
            require(_choices.length == 1, "Single choice vote allows only one option");
        }
        
        // 记录投票
        vote.hasVoted[msg.sender] = true;
        vote.voterChoices[msg.sender] = _choices;
        vote.totalVoters++;
        
        // 更新投票计数
        for (uint256 i = 0; i < _choices.length; i++) {
            vote.voteCounts[_choices[i]]++;
        }
        
        emit VoteCast(_voteId, msg.sender, _choices);
    }
    
    // 结束投票
    function endVote(uint256 _voteId) 
        public 
        voteExists(_voteId) 
        onlyVoteCreator(_voteId) 
    {
        Vote storage vote = votes[_voteId];
        require(vote.status == VoteStatus.Active, "Vote is not active");
        
        vote.status = VoteStatus.Ended;
        emit VoteEnded(_voteId);
    }
    
    // 取消投票
    function cancelVote(uint256 _voteId) 
        public 
        voteExists(_voteId) 
        onlyVoteCreator(_voteId) 
    {
        Vote storage vote = votes[_voteId];
        require(vote.status == VoteStatus.Active, "Vote is not active");
        
        vote.status = VoteStatus.Cancelled;
        emit VoteCancelled(_voteId);
    }
    
    // 获取投票基本信息
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
    
    // 获取投票结果
    function getVoteResults(uint256 _voteId) 
        public 
        view 
        voteExists(_voteId) 
        returns (uint256[] memory) 
    {
        return votes[_voteId].voteCounts;
    }
    
    // 检查用户是否已投票
    function hasUserVoted(uint256 _voteId, address _user) 
        public 
        view 
        voteExists(_voteId) 
        returns (bool) 
    {
        return votes[_voteId].hasVoted[_user];
    }
    
    // 获取用户投票选择
    function getUserVoteChoices(uint256 _voteId, address _user) 
        public 
        view 
        voteExists(_voteId) 
        returns (uint256[] memory) 
    {
        require(votes[_voteId].hasVoted[_user], "User has not voted");
        return votes[_voteId].voterChoices[_user];
    }
    
    // 检查用户是否有投票权限
    function canUserVote(uint256 _voteId, address _user) 
        public 
        view 
        voteExists(_voteId) 
        returns (bool) 
    {
        Vote storage vote = votes[_voteId];
        
        // 检查投票是否活跃
        if (vote.status != VoteStatus.Active) return false;
        if (block.timestamp < vote.startTime) return false;
        if (block.timestamp > vote.endTime) return false;
        
        // 检查用户是否已投票
        if (vote.hasVoted[_user]) return false;
        
        // 检查私有投票权限
        if (vote.isPrivate) {
            return vote.allowedVoters[_user];
        }
        
        return true;
    }
    
    // 获取所有投票ID列表
    function getAllVoteIds() public view returns (uint256[] memory) {
        uint256[] memory voteIds = new uint256[](voteCount);
        for (uint256 i = 0; i < voteCount; i++) {
            voteIds[i] = i;
        }
        return voteIds;
    }
    
    // 获取用户创建的投票ID列表
    function getUserCreatedVotes(address _user) public view returns (uint256[] memory) {
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
    
    // 获取用户参与的投票ID列表
    function getUserParticipatedVotes(address _user) public view returns (uint256[] memory) {
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
    
    // 自动结束过期的投票
    function autoEndExpiredVotes() public {
        for (uint256 i = 0; i < voteCount; i++) {
            if (votes[i].status == VoteStatus.Active && block.timestamp > votes[i].endTime) {
                votes[i].status = VoteStatus.Ended;
                emit VoteEnded(i);
            }
        }
    }
} 