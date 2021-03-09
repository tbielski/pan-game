class Stack {
  constructor() {
    this.stack = [];
    this.lastMovePut;
    this.lastMoveTake;
  }

  undoPut(player) {
    this.lastMovePut.forEach((card) => {
      player.hand.push(card);
      this.removeCard(card);
    });
  }

  undoTake(player) {
    this.lastMoveTake.forEach((card) => {
      player.removeCard(card);
      this.stack.push(card);
    });
  }

  putCards(cards) {
    cards.forEach((card) => this.putOnTop(card));
    this.lastMovePut = cards;
  }

  putOnTop(card) {
    this.stack.push(card);
  }

  takeCards() {
    let cards = [];
    if (this.stack.length >= 4) {
      cards = this.stack.slice(this.stack.length - 3);
    } else {
      cards = this.stack.slice(1);
    }
    cards.forEach((card) => this.takeFromTop(card));
    this.lastMoveTake = cards;
    return cards;
  }

  takeFromTop(card) {
    this.removeCard(card);
  }

  removeCard(card) {
    this.stack = this.stack.filter((c) => c.id != card.id);
  }
}

module.exports = Stack;
