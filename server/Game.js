const Deck = require("./Deck");
const Stack = require("./Stack");
const Voting = require("./Voting");

class Game {
  constructor(players, spectators, room, mqttHandler) {
    this.players = players;
    this.spectators = spectators;
    this.room = room;
    this.roomId = room.id;
    this.mqttHandler = mqttHandler;
    this.stack = new Stack();
    this.deck = new Deck();
    this.running = true;
    this.winner = "";
    this.turn;
    this.lastTurn;
    this.lastMoveType;
    this.voting;
  }

  addSpectator(viewer) {
    this.spectators.push(viewer);
    this.sendState();
    setTimeout(() => this.sendState(), 1500);
  }

  removeSpectator(spect) {
    this.spectators = this.spectators.filter((s) => s.id != spect.id);
    this.sendState();
    setTimeout(() => this.sendState(), 1500);
  }

  removePlayer(player) {
    if (this.turn.id === player.id) {
      this.nextTurn();
    }
    const left = player.left;
    const right = player.right;
    left.right = right;
    right.left = left;
    this.players = this.players.filter((p) => p.id !== player.id);
    this.sendState();
  }

  nextTurn() {
    this.lastTurn = this.turn;
    this.turn = this.turn.left;
  }

  requestUndo(id) {
    if (
      this.lastTurn &&
      id == this.lastTurn.id &&
      this.lastTurn.id !== this.turn.id
    ) {
      this.voting = new Voting(this.players.length);
      this.sendState();
    } else {
      throw new Error("Nie możesz teraz cofnąć ruchu");
    }
  }

  vote(vote, id) {
    if (this.voting) {
      this.voting.vote(vote, id);
      if (this.voting.hasEverybodyVoted()) {
        const res = this.voting.checkIfValid();
        if (res) {
          this.undo();
        }
        this.voting = null;
      }
      this.sendState();
    } else {
      throw new Error("Głosowanie nie jest aktywne");
    }
  }

  undo() {
    if (this.lastMoveType == "put") {
      this.stack.undoPut(this.lastTurn);
    } else if (this.lastMoveType == "take") {
      this.stack.undoTake(this.lastTurn);
    }
    this.turn = this.lastTurn;
    this.sendState();
  }

  takeCards(idPlayer) {
    if (this.winner == "") {
      if (!this.voting) {
        if (idPlayer == this.turn.id) {
          if (this.stack.stack.length > 1) {
            let cards = this.stack.takeCards();
            cards.forEach((card) => {
              this.turn.addCard(card);
            });
            this.nextTurn();
            this.lastMoveType = "take";
            this.sendState();
          } else {
            throw new Error("Brak kart do wzięcia");
          }
        } else {
          throw new Error("To nie twoja tura");
        }
      } else {
        throw new Error("Nie można zrobić ruchu, trwa głosowanie");
      }
    } else {
      throw new Error("Gra się skończyła");
    }
  }

  putCards(cards, idPlayer) {
    if (!this.voting) {
      if (idPlayer == this.turn.id) {
        if (this.stack.stack.length != 0) {
          if (
            this.checkIfThereIsXCards(cards, 1) ||
            this.checkIfThereIsXCards(cards, 4)
          ) {
            if (this.checkIfEveryCardHasSameValue(cards, cards[0].value)) {
              if (
                this.checkIfPowerIsBiggerOrEqual(
                  cards[0].power,
                  this.stack.stack[this.stack.stack.length - 1].power
                )
              ) {
                this.subPutCards(cards);
              } else {
                throw new Error(
                  "Karty muszą być równe lub starsze niż karta na wierzchu stosu"
                );
              }
            } else {
              throw new Error("Karty do położenia muszą mieć tą samą wartość");
            }
          } else if (this.checkIfThereIsXCards(cards, 3)) {
            if (
              this.stack.stack.length == 1 &&
              this.checkIfEveryCardHasSameValue(cards, "9")
            ) {
              if (
                this.checkIfPowerIsBiggerOrEqual(
                  cards[0].power,
                  this.stack.stack[this.stack.stack.length - 1].power
                )
              ) {
                this.subPutCards(cards);
              } else {
                throw new Error(
                  "Karty muszą być równe lub starsze niż karta na wierzchu stosu"
                );
              }
            } else {
              throw new Error(
                "Możesz położyć 3 karty tylko jeśli na wierzchu stosu jest 9 kier i twoje 3 karty do położenia są pozostałymi 9-tkami"
              );
            }
          } else {
            throw new Error("Musisz położyć inną liczbę kart");
          }
        } else if (cards.find((card) => card.id == "H_9")) {
          if (
            this.checkIfThereIsXCards(cards, 1) ||
            this.checkIfThereIsXCards(cards, 4)
          ) {
            if (this.checkIfEveryCardHasSameValue(cards, "9")) {
              if (cards[0].id == "H_9") {
                this.subPutCards(cards);
              } else {
                throw new Error(
                  "9 kier musi być pierwszą wybraną do położenia kartą, żeby była na dole stosu"
                );
              }
            } else {
              throw new Error("Karty do położenia muszą mieć te same wartości");
            }
          } else {
            throw new Error("Możesz położyć tylko 1 lub 4 karty na raz");
          }
        } else {
          throw new Error(
            "Musisz położyć 9 kier w swoim pierwszym ruchu jeśli masz ją na ręce"
          );
        }
      } else {
        throw new Error("To nie twoja tura");
      }
    } else {
      throw new Error("Nie można zrobić ruchu, trwa głosowanie");
    }
  }

  checkIfThereIsXCards(cards, x) {
    return cards.length == x;
  }

  checkIfEveryCardHasSameValue(cards, value) {
    const func = (card) => card.value == value;
    return cards.every(func);
  }

  checkIfPowerIsBiggerOrEqual(powerCard, powerStack) {
    if (powerCard >= powerStack) {
      return true;
    }
    return false;
  }

  subPutCards(cards) {
    this.stack.putCards(cards);
    cards.forEach((card) => {
      this.turn.removeCard(card);
    });
    this.checkForWin();
    if (this.winner == "") {
      this.nextTurn();
      this.lastMoveType = "put";
    }
    // this.checkForWin();
    this.sendState();
  }

  checkForWin() {
    if (this.turn.hand.length === 0) {
      this.running = false;
      this.winner = { name: this.turn.name, id: this.turn.id };
      this.room.game = null;
    }
  }

  sendState() {
    const viewers = this.spectators.map((viewer) => ({
      name: viewer.name,
      id: viewer.id,
    }));
    this.players.forEach((player) => {
      const index = this.players.findIndex((p) => p.id === player.id);
      const beforeEl = this.players.slice(0, index);
      const playerToSend = this.players
        .slice(index, this.players.length)
        .concat(beforeEl)
        .map((p) => ({
          cardsCount: p.hand.length,
          name: p.name,
          id: p.id,
        }));
      const message = {
        viewers: viewers,
        players: playerToSend,
        hand: player.hand.map((card) => ({
          color: card.color,
          value: card.value,
        })),
        winner: this.winner,
        voting: this.voting
          ? {
              name: this.lastTurn.name,
              id: this.lastTurn.id,
              playersWhoVoted: this.voting.playersWhoVoted,
            }
          : "",
        stack: this.stack.stack,
        running: this.running,
        turn: { id: this.turn.id, name: this.turn.name },
      };

      const toSend = JSON.stringify(message);
      this.mqttHandler.publish(
        `game-state/${this.roomId}/${player.id}`,
        toSend
      );
      this.sendViewState();
    });
  }

  sendViewState() {
    const playerToSend = this.players.map((p) => ({
      cardsCount: p.hand.length,
      name: p.name,
      id: p.id,
    }));
    const viewers = this.spectators.map((viewer) => ({
      name: viewer.name,
      id: viewer.id,
    }));
    const message = {
      viewers: viewers,
      players: playerToSend,
      stack: this.stack.stack,
      winner: this.winner,
      voting: this.voting
      ? {
          name: this.lastTurn.name,
          id: this.lastTurn.id,
          playersWhoVoted: this.voting.playersWhoVoted,
        }
      : "",
      running: this.running,
      turn: { id: this.turn.id, name: this.turn.name },
    };
    this.mqttHandler.publish(
      `spectate/${this.roomId}`,
      JSON.stringify(message)
    );
  }

  start() {
    this.players.forEach((player) => (player.game = this));
    this.deck.giveRandomCards(this.players);
    this.players.reduce((el, next) => {
      el.right = next;
      next.left = el;
      return next;
    });
    this.players[0].left = this.players[this.players.length - 1];
    this.players[this.players.length - 1].right = this.players[0];
    this.turn = this.players[
      this.players.findIndex((element) => element.checkIfHaveNineHearts())
    ];
    this.sendState();
  }
}

module.exports = Game;
