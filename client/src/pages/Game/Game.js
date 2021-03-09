import React, { useState, useEffect } from "react";
import { useParams, withRouter } from "react-router-dom";
import axios from "axios";
import { useAlert } from "react-alert";

import Card from "./Card/Card";
import InfoPlayers from "./InfoPlayers/InfoPlayers";
import Chat from "./Chat/Chat";
import "./Game.css";

const Game = (props) => {
  const { client, history } = props;
  const { roomId, mode } = useParams();
  const playerName = localStorage.getItem("playerName");
  const playerId = localStorage.getItem("playerId");
  const [selectedCards, setSelectedCards] = useState([]);
  const [gameState, setGameState] = useState(null);
  // const [spectState, setSpectState] = useState(null);
  const alert = useAlert();

  useEffect(() => {
    const loadedGameState = localStorage.getItem("gameData");
    if (loadedGameState) {
      setGameState(JSON.parse(loadedGameState));
    }
  }, []);

  useEffect(() => {
    if (client !== null && roomId !== null && playerId !== null) {
      if (mode === "player") {
        client.subscribe(`game-state/${roomId}/${playerId}`);
      } else if (mode === "spectator") {
        client.subscribe(`spectate/${roomId}`);
      }
      client.on("message", function (topic, message) {
        if (topic === `game-state/${roomId}/${playerId}`) {
          const newGameState = JSON.parse(message.toString());
          localStorage.setItem("gameData", JSON.stringify(message.toString()));
          setGameState(newGameState);
        } else if (topic === `spectate/${roomId}`) {
          const newGameState = JSON.parse(message.toString());
          localStorage.setItem("gameData", JSON.stringify(message.toString()));
          setGameState(newGameState);
        }
      });
    }
  }, [client, roomId, playerId]);

  const onPutCard = (e) => {
    e.preventDefault();

    axios
      .post(`http://localhost:5000/${playerId}/putCard`, {
        cardsIds: JSON.stringify(selectedCards),
      })
      .then(() => {
        setSelectedCards([]);
      })
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  const onTakeCard = (e) => {
    e.preventDefault();

    axios
      .post(`http://localhost:5000/${playerId}/takeCard`)
      .then()
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  const onUndo = (e) => {
    e.preventDefault();

    axios
      .post(`http://localhost:5000/${playerId}/undo`)
      .then()
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  const onLeave = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:5000/leaveRoom", {
        userId: playerId,
        roomId: roomId,
      })
      .then((result) => {
        history.push(`/menu/${playerId}`);
      })
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  return (
    <div className="Game">
      <div className="Game__TopBar">
        <h2>{playerName}</h2>
      </div>
      {mode === "player" ? (
        <> 
          <div className="Game__Hand">
            {gameState?.hand
              ? gameState.hand.map((cardInfo, index) => {
                  return (
                    <Card
                      key={cardInfo.value + "+" + cardInfo.color}
                      cardInfo={cardInfo}
                      pos={index}
                      selectedCards={selectedCards}
                      setSelectedCards={setSelectedCards}
                    />
                  );
                })
              : ""}
          </div>

          <div className="Game__Buttons">
            <form onSubmit={onTakeCard}>
              <input type="submit" value="Weź karty"></input>
            </form>
            <form onSubmit={onPutCard}>
              <input type="submit" value="Połóż zaznaczone karty"></input>
            </form>
            <form onSubmit={onUndo}>
              <input type="submit" value="Poproś o cofnięcie ruchu"></input>
            </form>
          </div>
        </>
      ) : (
        ""
      )}
      <div className="Game__InfoPlayers">
        {gameState ? <InfoPlayers gameInfo={gameState} mode={mode} /> : ""}
      </div>
      <div className="Game__Stack">
        {gameState?.stack
          ? gameState.stack.map((cardInfo, index) => {
              return (
                <Card
                  key={cardInfo.value + "-" + cardInfo.color}
                  cardInfo={cardInfo}
                  pos={index}
                />
              );
            })
          : ""}
      </div>
      {gameState && gameState.players ? (
        <Chat
          client={client}
          roomId={roomId}
          playerId={playerId}
          players={gameState.players}
          mode={mode}
        />
      ) : (
        ""
      )}
      <div className="Game__LeaveGame">
        <form onSubmit={onLeave}>
          <input type="submit" value="Wyjście z gry"></input>
        </form>
      </div>
    </div>
  );
};

export default withRouter(Game);
