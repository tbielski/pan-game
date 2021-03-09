import React, { useState, useEffect } from "react";
import { useAlert } from "react-alert";
import axios from "axios";

const Chat = (props) => {
  const { roomId, playerId, client, players, mode } = props;
  const alert = useAlert();
  const playerName = localStorage.getItem("playerName");
  const [newMessage, setNewMessage] = useState([]);
  const [newPrivateMessage, setNewPrivateMessage] = useState([]);
  const [currentPrivateChat, setCurrentPrivateChat] = useState("");

  useEffect(() => {
    if (client !== null && roomId !== null && playerId !== null) {
      client.subscribe(`chat/${roomId}`);
      client.subscribe(`chat/${roomId}/${playerId}`);
      client.on("message", function (topic, message) {
        if (topic === `chat/${roomId}`) {
          setNewMessage((mess) => [...mess, JSON.parse(message.toString())]);
        } else if (topic === `chat/${roomId}/${playerId}`) {
          setNewPrivateMessage((mess) => {
            return [...mess, JSON.parse(message.toString())];
          });
        }
      });
    }
  }, [client, roomId, playerId]);

  const onMessage = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    if (currentPrivateChat === "") {
      axios
        .post(`http://localhost:5000/${roomId}/chat`, {
          author: playerName,
          text: form.get("text"),
        })
        .then(() => {
          e.target.reset();
        })
        .catch((err) => {
          alert.error(err.response.data.message, { timeout: 2000 });
        });
    } else {
      const destinationId = players.filter(
        (plObj) => plObj.name === currentPrivateChat
      )[0].id;
      axios
        .post(`http://localhost:5000/${roomId}/chatPrivate`, {
          destinationId: destinationId,
          author: playerName,
          text: form.get("text"),
        })
        .then(() => {
          e.target.reset();
          setNewPrivateMessage((mess) => [
            ...mess,
            { author: playerName, text: form.get("text") },
          ]);
        })
        .catch((err) => {
          alert.error(err.response.data.message, { timeout: 2000 });
        });
    }
  };

  const onChangePrivateChat = (value) => {
    setCurrentPrivateChat(value);
  };

  return (
    <div className="Game__Chat">
      <div>
        {currentPrivateChat === ""
          ? "All"
          : `Private chat with ${currentPrivateChat}`}
      </div>
      <div className="Game__Chat__Buttons">
        <input
          type="button"
          onClick={() => onChangePrivateChat("")}
          value="All chat"
        />
        {mode === "player"
          ? players
              .filter((plObj) => plObj.id !== playerId)
              .map((pl) => (
                <input key={`${pl.name}`}
                  type="button"
                  onClick={() => onChangePrivateChat(pl.name)}
                  value={pl.name}
                />
              ))
          : ""}
      </div>
      <ul className="Game__Chat__Messages">
        {currentPrivateChat === ""
          ? newMessage.map((mess, index) => (
              <li key={`mess-${index}-${mess.text}`}>
                <strong>{mess.author}</strong>: {mess.text}
              </li>
            ))
          : newPrivateMessage
              .filter(
                (msgs) =>
                  msgs.author === currentPrivateChat ||
                  msgs.author === playerName
              )
              .map((mess, index) => (
                <li key={`mess-${index}-${mess.text}`}>
                  {mess.author}: {mess.text}
                </li>
              ))}
      </ul>
      <form onSubmit={onMessage} className="Game__Chat__Send">
        <input
          type="text"
          placeholder="Wpisz wiadomość"
          name="text"
          id="text"
        />
      </form>
    </div>
  );
};

export default Chat;
