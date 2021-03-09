import React from "react";

const Card = (props) => {
  const {
    cardInfo,
    pos,
    selectedCards,
    setSelectedCards,
  } = props;

  let cardName;
  let cardNameDash;
  if (Number.isInteger(+cardInfo.value)) {
    cardName = cardInfo.value + cardInfo.color[0].toUpperCase();
    cardNameDash = `${cardInfo.color[0].toUpperCase()}_${cardInfo.value}`;
  } else {
    cardName =
      cardInfo.value[0].toString().toUpperCase() +
      cardInfo.color[0].toString().toUpperCase();
    cardNameDash = `${cardInfo.color[0]
      .toString()
      .toUpperCase()}_${cardInfo.value[0].toString().toUpperCase()}`;
  }

  const cardObj = require(`../../../cards/${cardName}.png`).default;

  const cardClasses = ["Game__Hand__Card"];
  if (selectedCards) {
    const isSelected = selectedCards.findIndex((el) => el === cardNameDash);
    if (isSelected >= 0) {
      cardClasses.push("Game__Hand__Card-selected");
    }
  }

  const toggleSelectCard = () => {
    const isSelected = selectedCards.findIndex((el) => el === cardNameDash);
    const newSelectedCards = [...selectedCards];
    if (isSelected >= 0) {
      newSelectedCards.splice(isSelected, 1);
    } else {
      newSelectedCards.push(cardNameDash);
    }
    setSelectedCards(newSelectedCards);
  };

  return selectedCards ? (
    <div
      className={cardClasses.join(" ")}
      style={{ left: `${600 + pos * 50}px` }}
      onClick={toggleSelectCard}
    >
      <img draggable="false" src={cardObj} alt={cardName} />
    </div>
  ) : (
    <div className="Game__Stack__Card" style={{ left: `${pos * 50-500}px` }}>
      <img draggable="false" src={cardObj} alt={cardName} />
    </div>
  );
};

export default Card;
