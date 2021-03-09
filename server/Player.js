class Player {
  constructor(name, id) {
    this.name = name;
    this.id = id;
    this.hand = [];
    this.prevHand = this.hand;
    this.left;
    this.right;
    this.game;
  }

  requestUndo() {
    this.game.requestUndo(this.id);
  }

  vote(vote) {
    this.game.vote(vote, this.id);
  }

  checkIfHaveNineHearts() {
    if (this.hand.find((card) => card.id == "H_9")) {
      return true;
    }
    return false;
  }

  findCard(id) {
    const result = this.hand.find((card) => card.id == id);
    if (result) {
      return result;
    } else {
      throw new Error("Karty nie ma w ręce");
    }
  }

  takeCards(playerId) {
    this.game.takeCards(playerId);
  }

  putCards(cardsIds) {
    for (let i = 0; i < cardsIds.length; i++) {
      cardsIds[i] = this.findCard(cardsIds[i]);
    }
    this.game.putCards(cardsIds, this.id);
  }

  addCard(card) {
    this.hand.push(card);
  }

  removeCard(card) {
    this.hand = this.hand.filter((c) => c.id != card.id);
  }
}
module.exports = Player;
