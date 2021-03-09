const Card = require("./Card");

class Deck {
  constructor() {
    this.cards = [
      new Card("H", "9", 9),
      new Card("D", "9", 9),
      new Card("S", "9", 9),
      new Card("C", "9", 9),
      new Card("H", "10", 10),
      new Card("D", "10", 10),
      new Card("S", "10", 10),
      new Card("C", "10", 10),
      new Card("H", "J", 11),
      new Card("D", "J", 11),
      new Card("S", "J", 11),
      new Card("C", "J", 11),
      new Card("H", "Q", 12),
      new Card("D", "Q", 12),
      new Card("S", "Q", 12),
      new Card("C", "Q", 12),
      new Card("H", "K", 13),
      new Card("D", "K", 13),
      new Card("S", "K", 13),
      new Card("C", "K", 13),
      new Card("H", "A", 14),
      new Card("D", "A", 14),
      new Card("S", "A", 14),
      new Card("C", "A", 14),
    ];
  }

  getRandomCard() {
    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }
    const random = getRandomInt(0, this.cards.length);
    const card = this.cards[random];
    this.cards.splice(random, 1);
    return card;
  }

  giveRandomCards(players) {
    players.forEach((player) => {
      const newHand = [];
      for (let i = 0; i < 24 / players.length; i++) {
        const card = this.getRandomCard();
        newHand.push(card);
      }
      player.hand = newHand;
    });
  }

  removeCard(card) {
    this.cards = this.cards.filter((c) => c.id != card.id);
  }
}
module.exports = Deck;
