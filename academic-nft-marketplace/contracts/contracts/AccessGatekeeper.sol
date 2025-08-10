// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./AcademicAchievementNFT.sol";

contract AccessGatekeeper is AccessControl, ReentrancyGuard, Pausable {
    using Address for address;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPPORTUNITY_MANAGER_ROLE = keccak256("OPPORTUNITY_MANAGER_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    AcademicAchievementNFT public immutable nftContract;

    struct Opportunity {
        string title;
        string description;
        uint256[] requiredAchievementTypes; // Array of AchievementType enum values
        bool isActive;
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 startTime;
        uint256 endTime;
        string metadataURI;
    }

    mapping(uint256 => Opportunity) public opportunities;
    mapping(uint256 => mapping(address => bool)) public hasAccess;
    mapping(uint256 => mapping(address => uint256)) public accessGrantedAt;
    mapping(address => uint256) public userAccessCount; // Track access attempts per user
    mapping(address => uint256) public userLastAccess; // Rate limiting
    mapping(uint256 => bool) public isOpportunityFrozen; // Emergency freeze
    
    uint256 private _opportunityCounter;
    uint256 public constant MAX_ACCESS_PER_HOUR = 10;
    uint256 public constant ACCESS_COOLDOWN = 1 hours;

    event OpportunityCreated(
        uint256 indexed opportunityId,
        string title,
        uint256[] requiredAchievementTypes
    );
    
    event AccessGranted(
        uint256 indexed opportunityId,
        address indexed user,
        uint256 timestamp
    );
    
    event AccessRevoked(
        uint256 indexed opportunityId,
        address indexed user
    );
    
    event OpportunityFrozen(uint256 indexed opportunityId, address indexed admin);
    event OpportunityUnfrozen(uint256 indexed opportunityId, address indexed admin);
    event SuspiciousActivity(address indexed user, string reason);
    event EmergencyPause(address indexed admin, string reason);

    constructor(address _nftContract) {
        require(_nftContract.isContract(), "Invalid NFT contract address");
        nftContract = AcademicAchievementNFT(_nftContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(OPPORTUNITY_MANAGER_ROLE, msg.sender);
        _grantRole(EMERGENCY_ROLE, msg.sender);
    }

    // Security modifiers
    modifier notFrozen(uint256 opportunityId) {
        require(!isOpportunityFrozen[opportunityId], "Opportunity is frozen");
        _;
    }

    modifier rateLimited() {
        uint256 lastAccess = userLastAccess[msg.sender];
        if (block.timestamp < lastAccess + ACCESS_COOLDOWN) {
            uint256 accessCount = userAccessCount[msg.sender];
            require(accessCount < MAX_ACCESS_PER_HOUR, "Rate limit exceeded");
        } else {
            // Reset counter after cooldown period
            userAccessCount[msg.sender] = 0;
        }
        
        userAccessCount[msg.sender]++;
        userLastAccess[msg.sender] = block.timestamp;
        _;
    }

    modifier validOpportunity(uint256 opportunityId) {
        require(opportunityId < _opportunityCounter, "Opportunity does not exist");
        _;
    }

    function createOpportunity(
        string memory title,
        string memory description,
        uint256[] memory requiredAchievementTypes,
        uint256 maxParticipants,
        uint256 startTime,
        uint256 endTime,
        string memory metadataURI
    ) public onlyRole(OPPORTUNITY_MANAGER_ROLE) returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(requiredAchievementTypes.length > 0, "Must require at least one achievement type");
        require(endTime > startTime, "End time must be after start time");
        require(endTime > block.timestamp, "End time must be in the future");

        uint256 opportunityId = _opportunityCounter++;
        
        opportunities[opportunityId] = Opportunity({
            title: title,
            description: description,
            requiredAchievementTypes: requiredAchievementTypes,
            isActive: true,
            maxParticipants: maxParticipants,
            currentParticipants: 0,
            startTime: startTime,
            endTime: endTime,
            metadataURI: metadataURI
        });

        emit OpportunityCreated(opportunityId, title, requiredAchievementTypes);
        return opportunityId;
    }

    function requestAccess(uint256 opportunityId) 
        public 
        nonReentrant 
        whenNotPaused 
        rateLimited 
        validOpportunity(opportunityId)
        notFrozen(opportunityId) 
    {
        require(opportunities[opportunityId].isActive, "Opportunity is not active");
        require(block.timestamp >= opportunities[opportunityId].startTime, "Opportunity not yet started");
        require(block.timestamp <= opportunities[opportunityId].endTime, "Opportunity has ended");
        require(!hasAccess[opportunityId][msg.sender], "Access already granted");
        
        Opportunity storage opportunity = opportunities[opportunityId];
        require(opportunity.currentParticipants < opportunity.maxParticipants, "Opportunity is full");

        // Check if user has any of the required achievement types
        bool hasRequiredAchievement = false;
        for (uint256 i = 0; i < opportunity.requiredAchievementTypes.length; i++) {
            AchievementType achievementType = AchievementType(opportunity.requiredAchievementTypes[i]);
            if (nftContract.hasAchievementType(msg.sender, achievementType)) {
                hasRequiredAchievement = true;
                break;
            }
        }

        require(hasRequiredAchievement, "User does not have required achievement NFTs");

        hasAccess[opportunityId][msg.sender] = true;
        accessGrantedAt[opportunityId][msg.sender] = block.timestamp;
        opportunity.currentParticipants++;

        emit AccessGranted(opportunityId, msg.sender, block.timestamp);
    }

    function revokeAccess(uint256 opportunityId, address user) 
        public onlyRole(ADMIN_ROLE) {
        require(hasAccess[opportunityId][user], "User does not have access");
        
        hasAccess[opportunityId][user] = false;
        opportunities[opportunityId].currentParticipants--;
        
        emit AccessRevoked(opportunityId, user);
    }

    function deactivateOpportunity(uint256 opportunityId) 
        public onlyRole(OPPORTUNITY_MANAGER_ROLE) {
        require(opportunityId < _opportunityCounter, "Opportunity does not exist");
        opportunities[opportunityId].isActive = false;
    }

    function updateOpportunity(
        uint256 opportunityId,
        string memory title,
        string memory description,
        uint256 maxParticipants,
        uint256 endTime,
        string memory metadataURI
    ) public onlyRole(OPPORTUNITY_MANAGER_ROLE) {
        require(opportunityId < _opportunityCounter, "Opportunity does not exist");
        require(endTime > block.timestamp, "End time must be in the future");
        
        Opportunity storage opportunity = opportunities[opportunityId];
        opportunity.title = title;
        opportunity.description = description;
        opportunity.maxParticipants = maxParticipants;
        opportunity.endTime = endTime;
        opportunity.metadataURI = metadataURI;
    }

    function checkAccess(uint256 opportunityId, address user) 
        public view returns (bool) {
        if (!opportunities[opportunityId].isActive) return false;
        if (block.timestamp > opportunities[opportunityId].endTime) return false;
        return hasAccess[opportunityId][user];
    }

    function getOpportunity(uint256 opportunityId) 
        public view returns (Opportunity memory) {
        require(opportunityId < _opportunityCounter, "Opportunity does not exist");
        return opportunities[opportunityId];
    }

    function getActiveOpportunities() 
        public view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active opportunities
        for (uint256 i = 0; i < _opportunityCounter; i++) {
            if (opportunities[i].isActive && block.timestamp <= opportunities[i].endTime) {
                activeCount++;
            }
        }
        
        uint256[] memory activeIds = new uint256[](activeCount);
        uint256 index = 0;
        
        // Populate array with active opportunity IDs
        for (uint256 i = 0; i < _opportunityCounter; i++) {
            if (opportunities[i].isActive && block.timestamp <= opportunities[i].endTime) {
                activeIds[index] = i;
                index++;
            }
        }
        
        return activeIds;
    }

    function getUserAccessibleOpportunities(address user) 
        public view returns (uint256[] memory) {
        uint256[] memory activeOpportunities = getActiveOpportunities();
        uint256 accessibleCount = 0;
        
        // Count accessible opportunities
        for (uint256 i = 0; i < activeOpportunities.length; i++) {
            uint256 opportunityId = activeOpportunities[i];
            Opportunity storage opportunity = opportunities[opportunityId];
            
            // Check if user has any required achievement
            for (uint256 j = 0; j < opportunity.requiredAchievementTypes.length; j++) {
                AchievementType achievementType = AchievementType(opportunity.requiredAchievementTypes[j]);
                if (nftContract.hasAchievementType(user, achievementType)) {
                    accessibleCount++;
                    break;
                }
            }
        }
        
        uint256[] memory accessibleIds = new uint256[](accessibleCount);
        uint256 index = 0;
        
        // Populate array with accessible opportunity IDs
        for (uint256 i = 0; i < activeOpportunities.length; i++) {
            uint256 opportunityId = activeOpportunities[i];
            Opportunity storage opportunity = opportunities[opportunityId];
            
            for (uint256 j = 0; j < opportunity.requiredAchievementTypes.length; j++) {
                AchievementType achievementType = AchievementType(opportunity.requiredAchievementTypes[j]);
                if (nftContract.hasAchievementType(user, achievementType)) {
                    accessibleIds[index] = opportunityId;
                    index++;
                    break;
                }
            }
        }
        
        return accessibleIds;
    }

    function totalOpportunities() public view returns (uint256) {
        return _opportunityCounter;
    }

    // Emergency functions
    function emergencyPause(string memory reason) external onlyRole(EMERGENCY_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }

    function emergencyUnpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    function freezeOpportunity(uint256 opportunityId, string memory reason) 
        external 
        onlyRole(ADMIN_ROLE) 
        validOpportunity(opportunityId) 
    {
        isOpportunityFrozen[opportunityId] = true;
        emit OpportunityFrozen(opportunityId, msg.sender);
        emit SuspiciousActivity(msg.sender, reason);
    }

    function unfreezeOpportunity(uint256 opportunityId) 
        external 
        onlyRole(ADMIN_ROLE) 
        validOpportunity(opportunityId) 
    {
        isOpportunityFrozen[opportunityId] = false;
        emit OpportunityUnfrozen(opportunityId, msg.sender);
    }

    // Batch operations for gas efficiency
    function batchRevokeAccess(uint256 opportunityId, address[] memory users) 
        external 
        onlyRole(ADMIN_ROLE) 
        validOpportunity(opportunityId) 
    {
        for (uint256 i = 0; i < users.length; i++) {
            if (hasAccess[opportunityId][users[i]]) {
                hasAccess[opportunityId][users[i]] = false;
                opportunities[opportunityId].currentParticipants--;
                emit AccessRevoked(opportunityId, users[i]);
            }
        }
    }

    // Security analytics
    function getUserAccessStats(address user) external view returns (
        uint256 accessCount,
        uint256 lastAccess,
        bool isRateLimited
    ) {
        accessCount = userAccessCount[user];
        lastAccess = userLastAccess[user];
        isRateLimited = (block.timestamp < lastAccess + ACCESS_COOLDOWN) && 
                       (accessCount >= MAX_ACCESS_PER_HOUR);
    }

    // Check if opportunity is accessible to user
    function isOpportunityAccessible(uint256 opportunityId, address user) 
        external 
        view 
        validOpportunity(opportunityId) 
        returns (bool accessible, string memory reason) 
    {
        Opportunity storage opportunity = opportunities[opportunityId];
        
        if (isOpportunityFrozen[opportunityId]) {
            return (false, "Opportunity is frozen");
        }
        
        if (!opportunity.isActive) {
            return (false, "Opportunity is not active");
        }
        
        if (block.timestamp < opportunity.startTime) {
            return (false, "Opportunity not yet started");
        }
        
        if (block.timestamp > opportunity.endTime) {
            return (false, "Opportunity has ended");
        }
        
        if (opportunity.currentParticipants >= opportunity.maxParticipants) {
            return (false, "Opportunity is full");
        }
        
        if (hasAccess[opportunityId][user]) {
            return (false, "Access already granted");
        }
        
        // Check if user has any required achievement
        bool hasRequiredAchievement = false;
        for (uint256 i = 0; i < opportunity.requiredAchievementTypes.length; i++) {
            AchievementType achievementType = AchievementType(opportunity.requiredAchievementTypes[i]);
            if (nftContract.hasAchievementType(user, achievementType)) {
                hasRequiredAchievement = true;
                break;
            }
        }
        
        if (!hasRequiredAchievement) {
            return (false, "User does not have required achievement NFTs");
        }
        
        // Check rate limiting
        uint256 lastAccess = userLastAccess[user];
        if (block.timestamp < lastAccess + ACCESS_COOLDOWN) {
            uint256 accessCount = userAccessCount[user];
            if (accessCount >= MAX_ACCESS_PER_HOUR) {
                return (false, "Rate limit exceeded");
            }
        }
        
        return (true, "Accessible");
    }
}