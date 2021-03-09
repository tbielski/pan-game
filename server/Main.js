class Main {
  constructor() {
    this.rooms = [];
    this.registeredPlayers = [];
    this.roomNumber = 1;
    this.playerId = 1;
  }

  addRoom(room) {
    this.rooms.push(room);
    this.roomNumber += 1;
  }

  addRegisteredPlayer(player) {
    this.registeredPlayers.push(player);
    this.playerId += 1;
  }

  findPlayerById(id) {
    const player = this.registeredPlayers.find((player) => player.id == id);
    if (player) {
      return player;
    } else {
      throw Error("Nie znaleziono gracza");
    }
  }

  findRoomById(id) {
    const room = this.rooms.find((room) => room.id === parseInt(id));
    if (room) {
      return room;
    } else {
      throw Error("Nie znaleziono pokoju");
    }
  }
}

module.exports = Main;
