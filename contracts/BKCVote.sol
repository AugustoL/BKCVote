
contract BKCVote {

   uint public blockStart;
   uint public blockEnd;
   bool public ended;
   address public owner;
   string public electionName;
   uint public votesDone;
   uint public votesToVerify;

   event newVoter(address);
   event newPostulant(address);
   event voteAdded(address);
   event voteVerified(address, address);
   event verifierSet(address, address);
   event error(uint);

   struct Voter {
       address addr;
       string name;
       string surename;
       string born_date;
       string personal_id;
       string phisical_address;
       address verifier;
       bool verified;
       bool alreadyVote;
   }

   struct Postulant {
       address addr;
       string name;
       string surename;
       string party;
       uint votesAmount;
   }

   mapping(address => uint) public votersIndex;
   Voter[] public voters;

   mapping(address => uint) public postulantsIndex;
   Postulant[] public postulants;

   mapping(address => address) private votes;

   function BKCVote(string _electionName, uint _blockStart, uint _blockEnd) {
       ended = false;
       owner = msg.sender;
       blockStart = _blockStart;
       blockEnd = _blockEnd;
       electionName = _electionName;
       voters.length ++;
       postulants.length ++;
       votesDone = 0;
       votesToVerify = 0;
   }

   /*

   ERROR CODES

   Error 0 = Unauthorized Access.
   Error 1 = Invalid Block Access.
   Error 2 = Invalid Address.
   Error 3 = Insufficent Balance.
   Error 4 = Vote aldready done.
   Error 5 = Vote already verified.
   Error 6 = Vote not done.
   Error 7 = Verifier not set.

   */

   function addVoter(address _addr,  string _name,  string _surename,  string _born_date,  string _personal_id, string _phisical_address) returns (bool){
       if (owner != msg.sender){
           error(0);
           return (false);
       } else if (block.number > blockStart){
           error(1);
           return (false);
       } else if (votersIndex[_addr] > 0) {
           error(2);
           return (false);
       } else {
           uint pos = voters.length ++;
           voters[pos] = Voter(_addr, _name, _surename, _born_date, _personal_id, _phisical_address, 0x0, false, false);
           votersIndex[_addr] = pos;
           votes[_addr] = address(0x0);
           newVoter(_addr);
           return (true);
       }
   }

   function addPostulant(address _addr,  string _party) returns (bool){
       if (owner != msg.sender){
           error(0);
           return (false);
       } else if (block.number > blockStart){
           error(1);
           return (false);
       } else if ((postulantsIndex[_addr] > 0) || (votersIndex[_addr] == 0)) {
           error(2);
           return (false);
       } else {
           uint pos = postulants.length++;
           Voter postulant = voters[votersIndex[_addr]];
           postulants[pos] = Postulant(_addr, postulant.name, postulant.surename, _party, 0);
           postulantsIndex[_addr] = pos;
           newPostulant(_addr);
           return (true);
       }
   }

   function setVerifier(address _addr, address _verifier) returns (bool){
       if (owner != msg.sender){
           error(0);
           return (false);
       } else if (block.number > blockStart){
           error(1);
           return (false);
       } else if ((votersIndex[_addr] == 0) || (votersIndex[_verifier] == 0)) {
           error(2);
           return (false);
       } else {
           voters[ votersIndex[_addr] ].verifier = _verifier;
           verifierSet(_addr, _verifier);
           return (true);
       }
   }

   function vote(address _toVote) returns (bool){
       if ((block.number < blockStart) || (block.number > blockEnd)){
           error(1);
           return (false);
       } else {
           uint voterIndex = votersIndex[msg.sender];
           if (( voterIndex  == 0) || ( postulantsIndex[_toVote] == 0)) {
               error(2);
               return (false);
           } else if (voters[voterIndex].alreadyVote){
               error(4);
               return (false);
           } else if (voters[voterIndex].verifier == address(0x0)){
               error(7);
               return (false);
           }  else {
               voters[voterIndex].alreadyVote = true;
               votes[msg.sender] = _toVote;
               votesDone ++;
               votesToVerify ++;
               voteAdded(msg.sender);
               return (true);
           }
       }
   }

   function verify(address _toVerify) returns (bool){
       if (block.number < blockStart){
           error(1);
           return (false);
       } else {
           uint _toVerifyIndex = votersIndex[_toVerify];
           if (_toVerifyIndex == 0){
               error(2);
               return (false);
           } else if (!voters[_toVerifyIndex].alreadyVote){
               error(6);
               return (false);
           } else if (voters[_toVerifyIndex].verifier != msg.sender){
               error(0);
               return (false);
           } else {
               postulants[ postulantsIndex[ votes[_toVerify] ] ].votesAmount ++;
               voters[ _toVerifyIndex ].verified = true;
               votesToVerify --;
               voteVerified(_toVerify, msg.sender);
               return (true);
           }
       }
   }

   function seeVote() constant returns (address, bool){
       uint voterIndex = votersIndex[msg.sender];
       if ((voterIndex > 0) && (voters[voterIndex].alreadyVote)){
           return (votes[msg.sender], voters[voterIndex].verified);
       } else {
           return (0x0, false);
       }
   }

   function getVotersCount() public constant returns(uint) {
       return voters.length;
   }

   function getPostulantsCount() public constant returns(uint) {
       return postulants.length;
   }

}
