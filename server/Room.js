const Chat = require("./Chat");
const Game = require("./Game");

class Room {
  constructor(id, player, mqttHandler) {
    this.id = id;
    this.players = [player];
    this.spectators = [];
    this.mqttHandler = mqttHandler;
    this.chat = new Chat(id, mqttHandler);
    this.game;
    this.refresh();
  }

  privateMessage(message, destinationId) {
    this.chat.privateMessage(message, destinationId);
  }

  message(message) {
    this.chat.message(message);
  }

  addPlayer(player) {
    if (!this.game) {
      if (this.players.length < 4) {
        this.players.push(player);
        this.refresh();
      } else {
        throw new Error("Pokój jest pełen");
      }
    } else {
      throw new Error("Gra już wystartowała");
    }
  }

  addSpectator(spectator) {
    if (this.game) {
      this.game.addSpectator(spectator);
    }
    this.refresh();
  }

  removePlayer(player) {
    if (this.players.find((p) => p.id == player.id)) {
      this.players = this.players.filter((p) => p.id != player.id);
      if (this.game) {
        this.game.removePlayer(player);
      }
    } else if (this.spectators.find((p) => p.id == player.id)) {
      this.spectators = this.spectators.filter((p) => p.id != player.id);
      if (this.game) {
        this.game.removeSpectator(player);
      }
    } else {
      throw new Error("Nie znaleziono gracza");
    }
    this.refresh();
  }

  startGame() {
    this.game = new Game(this.players, this.spectators, this, this.mqttHandler);
    this.game.start();
  }

  refresh() {
    setTimeout(() => {
      this.mqttHandler.publish(
        `room/${this.id}`,
        JSON.stringify({
          players: this.players.map((element) => ({
            name: element.name,
            id: element.id,
          })),
          spectator: this.spectators.map((element) => ({
            name: element.name,
            id: element.id,
          })),
        })
      );
      // this.game ? this.game.sendState() : ""
    }, 2000);
  }
}

module.exports = Room;
