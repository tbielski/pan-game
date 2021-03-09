class Voting {
  constructor(votesRequired) {
    this.votesRequired = votesRequired;
    this.votes = [];
    this.playersWhoVoted = [];
  }

  vote(vote, id) {
    this.votes.push(vote);
    this.playersWhoVoted.push(id);
  }

  hasEverybodyVoted() {
    return this.votes.length === this.votesRequired;
  }

  checkIfValid() {
    if (this.votes.every((el) => el === "yes")) {
      return true;
    }
    return false;
  }
}

module.exports = Voting;
