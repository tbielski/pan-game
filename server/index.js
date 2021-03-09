const express = require("express");
const cors = require("cors");

const Main = require("./Main");
const Room = require("./Room");
const Player = require("./Player");
const Message = require("./Message");
const MqttHandler = require("./MqttHandler");

const app = express();
const port = 5000;
const main = new Main();
const mqttHandler = new MqttHandler();
mqttHandler.connect();

app.use(express.json());
app.use(cors());

app.post("/newPlayer", (req, res) => {
  const { name } = req.body;
  const player = new Player(name, main.playerId.toString());
  main.addRegisteredPlayer(player);
  res.send({ playerId: player.id, name: name });
});

app.post("/newRoom", (req, res) => {
  try {
    const id = req.body.id;
    const player = main.findPlayerById(id);
    const room = new Room(main.roomNumber, player, mqttHandler);
    main.addRoom(room);
    res.send({ roomId: room.id });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/joinRoom", (req, res) => {
  const userId = req.body.userId;
  const roomId = req.body.roomId;
  try {
    const player = main.findPlayerById(userId);
    const room = main.findRoomById(roomId);
    room.addPlayer(player);
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/leaveRoom", (req, res) => {
  const userId = req.body.userId;
  const roomId = req.body.roomId;
  try {
    const player = main.findPlayerById(userId);
    const room = main.findRoomById(roomId);
    room.removePlayer(player);
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/:roomId/startGame", (req, res) => {
  const roomId = req.params.roomId;
  try {
    const room = main.findRoomById(roomId);
    room.startGame();
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/joinView", (req, res) => {
  const userId = req.body.userId;
  const roomId = req.body.roomId;
  try {
    const player = main.findPlayerById(userId);
    const room = main.findRoomById(roomId);
    if (room.game) {
      room.addSpectator(player);
      res.send({ status: true });
    } else {
      throw new Error("Gra w tym pokoju jeszcze nie wystartowała");
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/:userId/vote", (req, res) => {
  const userId = req.params.userId;
  try {
    const vote = req.body.vote;
    const player = main.findPlayerById(userId);
    player.vote(vote);
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/:userId/undo", (req, res) => {
  const userId = req.params.userId;
  try {
    const player = main.findPlayerById(userId);
    player.requestUndo();
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/:userId/takeCard", (req, res) => {
  const userId = req.params.userId;
  try {
    const player = main.findPlayerById(userId);
    player.takeCards(userId);
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/:userId/putCard", (req, res) => {
  const userId = req.params.userId;
  try {
    const cardsIds = JSON.parse(req.body.cardsIds);
    const player = main.findPlayerById(userId);
    player.putCards(cardsIds);
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/:id/chat", (req, res) => {
  const id = req.params.id;
  const message = new Message(req.body.author, req.body.text);
  try {
    const room = main.findRoomById(id);
    room.message(message);
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.post("/:id/chatPrivate", (req, res) => {
  const id = req.params.id;
  const destinationId = req.body.destinationId;
  const message = new Message(req.body.author, req.body.text);
  try {
    const room = main.findRoomById(id);
    room.privateMessage(message, destinationId);
    res.send({ status: true });
  } catch (error) {
    console.log(error);
    res.status(400).send({ status: false, message: error.message });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
