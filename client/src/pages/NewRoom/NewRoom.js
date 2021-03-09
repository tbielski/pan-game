import React, { useEffect, useState } from "react";
import { useParams, withRouter } from "react-router-dom";
import { useAlert } from "react-alert";
import axios from "axios";

const NewRoom = (props) => {
  const { roomId, mode } = useParams();
  const alert = useAlert();
  const playerName = localStorage.getItem("playerName");
  const playerId = localStorage.getItem("playerId");
  const { client, history } = props;
  const [playersList, setPlayersList] = useState(null);

  useEffect(() => {
    if (client !== null && roomId !== null && playerId !== null) {
      client.subscribe(`room/${roomId}`);
      client.subscribe(`game-state/${roomId}/${playerId}`);
      client.on("message", function (topic, message) {
        if (topic === `room/${roomId}`) {
          setPlayersList(JSON.parse(message.toString()));
        } else if (topic === `game-state/${roomId}/${playerId}`) {
          localStorage.setItem("gameData", message.toString());
          history.push(`/game/${roomId}/player`);
        }
      });
    }
  }, [client, roomId, playerId, history]);

  const onStartGame = (e) => {
    e.preventDefault();

    axios
      .post(`http://localhost:5000/${roomId}/startGame`)
      .then((result) => {
        history.push(`/game/${roomId}/player`);
      })
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  const onLeaveRoom = (e) => {
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
    <div>
      <div>
        Pokój nr {roomId},{" "}
        {mode === "host" ? "host" : mode === "spectator" ? "widz" : "gracz"}:{" "}
        {playerName}
      </div>
      <div>
        <form onSubmit={onStartGame}>
          <input
            type="submit"
            disabled={
              mode === "host" && playersList?.players.length > 1
                ? ""
                : "disabled"
            }
            value="Start gry"
          />
        </form>
        <form onSubmit={onLeaveRoom}>
          <input type="submit" value="Opuść pokój" />
        </form>
      </div>
      <div>
        <h2>Player list</h2>
        <ul>
          {playersList
            ? playersList.players.map((playerObj) =>
                playerObj.id === playerId ? (
                  <li key={playerObj.id}>
                    <strong>{playerObj.name}</strong>
                  </li>
                ) : (
                  <li key={playerObj.id}>{playerObj.name}</li>
                )
              )
            : ""}
        </ul>
      </div>
    </div>
  );
};

export default withRouter(NewRoom);
