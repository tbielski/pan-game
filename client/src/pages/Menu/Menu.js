import React from "react";
import { useParams, withRouter } from "react-router-dom";
import { useAlert } from "react-alert";
import axios from "axios";

const Menu = (props) => {
  const { playerId } = useParams();
  const alert = useAlert();
  const playerName = localStorage.getItem("playerName");

  const onAddNewRoom = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:5000/newRoom", { id: playerId })
      .then((result) => {
        localStorage.setItem("roomId", result.data.roomId);
        props.history.push(`/room/${result.data.roomId}/host`);
      })
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  const onJoinRoomPlayer = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    axios
      .post("http://localhost:5000/joinRoom", {
        userId: playerId,
        roomId: form.get("roomId"),
      })
      .then((result) => {
        localStorage.setItem("roomId", form.get("roomId"));
        props.history.push(`/room/${form.get("roomId")}/player`);
      })
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  const onJoinRoomSpectator = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    axios
      .post("http://localhost:5000/joinView", {
        userId: playerId,
        roomId: form.get("roomId"),
      })
      .then((result) => {
        localStorage.setItem("roomId", form.get("roomId"));
        props.history.push(`/game/${form.get("roomId")}/spectator`);
      })
      .catch((err) => {
        alert.error(err.response.data.message, { timeout: 2000 });
      });
  };

  return (
    <div>
      Witaj {playerName}!<div style={{ color: "red" }}></div>
      <div>
        <form onSubmit={onAddNewRoom}>
          <input type="submit" value="Stwórz nowy pokój"></input>
        </form>
      </div>
      <div>
        <form onSubmit={onJoinRoomPlayer}>
          <label htmlFor="roomId">Numer pokoju </label>
          <input type="text" name="roomId" id="roomId"></input>
          <input type="submit" value="Dołącz do pokoju jako gracz"></input>
        </form>
      </div>
      <div>
        <form onSubmit={onJoinRoomSpectator}>
          <label htmlFor="roomId">Numer pokoju </label>
          <input type="text" name="roomId" id="roomId"></input>
          <input
            type="submit"
            value="Dołącz do trwającej gry jako widz"
          ></input>
        </form>
      </div>
    </div>
  );
};

export default withRouter(Menu);
