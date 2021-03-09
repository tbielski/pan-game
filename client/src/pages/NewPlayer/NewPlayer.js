import React from "react";
import axios from "axios";
import { useAlert } from "react-alert";
import { withRouter } from "react-router-dom";

const NewPlayer = (props) => {
  const alert = useAlert();
  const onAddNewPlayer = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    axios
      .post("http://localhost:5000/newPlayer", { name: form.get("playerName") })
      .then((result) => {
        localStorage.setItem("playerId", result.data.playerId);
        localStorage.setItem("playerName", result.data.name);
        props.history.push(`/menu/${result.data.playerId}`);
      })
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  return (
    <div>
      <form onSubmit={(e) => onAddNewPlayer(e)}>
        <label htmlFor="playerName">
          <h1>Podaj imie:</h1>
        </label>
        <input type="text" id="playerName" name="playerName"></input>
      </form>
    </div>
  );
};

export default withRouter(NewPlayer);
