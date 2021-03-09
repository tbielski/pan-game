class Card {
  constructor(color, value, power) {
    this.color = color;
    this.value = value;
    this.id = `${color}_${value}`;
    this.power = power;
  }
}

module.exports = Card;
