pragma solidity ^0.4.2;
contract BKCVote {

    // Contract Owner
    address public owner;

    //Stage of the election
    // 0 = Ready
    // 1 = Started
    // 2 = Finished
    uint public stage;

    string public electionName;
    uint public votesDone;
    uint public votesToVerify;

    event newStage(uint);
    event newVoter(address);
    event newPostulant(uint, string, string);
    event voteAdded(address);
    event voteVerified(address, address);
    event verifierSet(address, address);
    event error(uint);

    modifier fromOwner() {
        if (owner == msg.sender) {
            _;
        } else {
            error(0);
        }
    }

    modifier onStage(uint stageRequired) {
        if (stage == stageRequired) {
            _;
        } else {
            error(1);
        }
    }

    modifier requiredBalance(uint balanceRequried) {
        if (this.balance >= balanceRequried) {
            _;
        } else {
            error(3);
        }
    }

    struct Voter {
        address addr;
        string name;
        string surename;
        string born_date;
        string personal_id;
        string phisical_address;
        address verifier;
        bool verified;
        bool voted;
    }

    struct Postulant {
        uint id;
        string name;
        string party;
        uint votes;
    }

    mapping(address => uint) public votersIndex;
    Voter[] public voters;

    mapping(uint => uint) public postulantsIndex;
    Postulant[] public postulants;

    mapping(address => uint) private votes;

    function BKCVote(string _electionName) {
        owner = msg.sender;
        electionName = _electionName;
        voters.length ++;
        postulants.length ++;
        stage = 0;
        votesDone = 0;
        votesToVerify = 0;
    }

    /*

    ERROR CODES

    Error 0 = Unauthorized Access.
    Error 1 = Invalid Stage.
    Error 2 = Invalid Address.
    Error 3 = Insufficent Balance.
    Error 4 = Vote aldready done.
    Error 5 = Vote already verified.
    Error 6 = Vote not done.
    Error 7 = Verifier not set.
    Error 8 = Postulant already added.
    Error 9 = Invalid change of stage.
    */

    function setStage(uint _stage) fromOwner() returns (bool){
        if (_stage > stage){
            stage = _stage;
            newStage(_stage);
            return (true);
        } else {
            error(9);
            return (false);
        }
    }

    function addVoter(address _addr,  string _name,  string _surename,  string _born_date, string _personal_id, string _phisical_address) fromOwner() onStage(0) requiredBalance(5000000000000000) returns (bool){
        if (votersIndex[_addr] > 0) {
            error(2);
            return (false);
        } else {
            uint pos = voters.length ++;
            voters[pos] = Voter(_addr, _name, _surename, _born_date, _personal_id, _phisical_address, 0x0, false, false);
            votersIndex[_addr] = pos;
            newVoter(_addr);
            if (_addr.send(5000000000000000))
                return (true);
        }
    }

    function addPostulant(uint _id, string _name,  string _party) fromOwner() onStage(0) returns (bool){
        for (uint i = 0; i < postulants.length; i ++)
            if (postulants[i].id == _id){
                error(8);
                return (false);
            }
        uint pos = postulants.length++;
        postulants[pos] = Postulant(_id, _name, _party, 0);
        postulantsIndex[_id] = pos;
        newPostulant(_id, _name, _party);
        return (true);
    }

    function setVerifier(address _addr, address _verifier) fromOwner() onStage(0) requiredBalance(2000000000000000) returns (bool){
        if ((votersIndex[_addr] == 0) || (votersIndex[_verifier] == 0)) {
            error(2);
            return (false);
        } else {
            voters[ votersIndex[_addr] ].verifier = _verifier;
            verifierSet(_addr, _verifier);
            if (_verifier.send(2000000000000000))
                return (true);
        }
    }

    function vote(uint _toVote) onStage(1) returns (bool){
        uint voterIndex = votersIndex[msg.sender];
        if (( voterIndex  == 0) || ( postulantsIndex[_toVote] == 0)) {
            error(2);
            return (false);
        } else if (voters[voterIndex].voted){
            error(4);
            return (false);
        } else if (voters[voterIndex].verifier == address(0x0)){
            error(7);
            return (false);
        }  else {
            voters[voterIndex].voted = true;
            votes[msg.sender] = _toVote;
            votesDone ++;
            votesToVerify ++;
            voteAdded(msg.sender);
            return (true);
        }
    }

    function verify(address _toVerify) onStage(1) returns (bool){
        uint _toVerifyIndex = votersIndex[_toVerify];
        if (_toVerifyIndex == 0){
            error(2);
            return (false);
        } else if (!voters[_toVerifyIndex].voted){
            error(6);
            return (false);
        } else if (voters[_toVerifyIndex].verifier != msg.sender){
            error(0);
            return (false);
        } else {
            postulants[ postulantsIndex[ votes[_toVerify] ] ].votes ++;
            voters[ _toVerifyIndex ].verified = true;
            votesToVerify --;
            voteVerified(_toVerify, msg.sender);
            return (true);
        }
    }

    function seeVote() constant returns (uint){
        uint voterIndex = votersIndex[msg.sender];
        if (voterIndex == 0) {
            error(0);
            return (0);
        } else if (voters[voterIndex].voted){
            return (votes[msg.sender]);
        } else {
            return (1);
        }
    }

    function getVotersCount() public constant returns(uint) {
        return voters.length;
    }

    function getPostulantsCount() public constant returns(uint) {
        return postulants.length;
    }

    function getPostulantIndex(uint _id) public constant returns(uint) {
        return postulantsIndex[_id];
    }

    function stringsEqual(string storage _a, string memory _b) internal returns (bool) {
		bytes storage a = bytes(_a);
		bytes memory b = bytes(_b);
        bool equals = true;
		if (a.length != b.length)
			equals = false;
		if (equals)
    		for (uint i = 0; i < a.length; i ++)
    			if ((a[i] != b[i]) && (equals))
    				equals = false;
		return (equals);
	}

}
