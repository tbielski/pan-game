import React from "react";
import { useAlert } from "react-alert";
import axios from "axios";

const InfoPlayers = (props) => {
  const { gameInfo, mode } = props;
  const alert = useAlert();
  const playerId = localStorage.getItem("playerId");

  const onVote = (e, decision) => {
    e.preventDefault();

    axios
      .post(`http://localhost:5000/${playerId}/vote`, { vote: decision })
      .then()
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  return (
    <div>
      <div>
        <h2>Gracze:</h2>
        <ul>
          {gameInfo.players
            ? gameInfo.players.map((playerObj) => (
                <li key={playerObj.id}>{playerObj.name} ma {playerObj.cardsCount} kart</li>
              ))
            : ""}
        </ul>
        <h2>Widzowie:</h2>
        <ul>
          {gameInfo.viewers
            ? gameInfo.viewers.map((viewerObj) => (
                <li key={viewerObj.id}>{viewerObj.name}</li>
              ))
            : ""}
        </ul>
      </div>
      <div>
        {gameInfo.turn ? <h2>Teraz karty kładzie {gameInfo.turn.name}</h2> : ""}
      </div>
      {gameInfo.voting ? (
        <div>
          <h4>
            Głosowanie aktywne - czy cofnąć ruch gracza {gameInfo.voting.name}?
          </h4>
          {mode === "player" ? (
            <>
              <form onSubmit={(e) => onVote(e, "yes")}>
                <input type="submit" value="Tak" />
              </form>
              <form onSubmit={(e) => onVote(e, "no")}>
                <input type="submit" value="Nie" />
              </form>
            </>
          ) : (
            ""
          )}
          <p>
            Zagłosowało {gameInfo.voting.playersWhoVoted.length}/
            {gameInfo.players.length}
          </p>
        </div>
      ) : (
        <div>
          <h4>Głosowanie nieaktywne</h4>
        </div>
      )}
      <div>{gameInfo.winner ? <h1>Wygrał: {gameInfo.winner.name}</h1> : ""}</div>
    </div>
  );
};

export default InfoPlayers;
