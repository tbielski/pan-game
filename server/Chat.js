class Chat {
  constructor(id, mqttHandler) {
    this.id = id;
    this.mqttHandler = mqttHandler;
  }

  message(message) {
    this.mqttHandler.publish(`chat/${this.id}`, JSON.stringify(message));
  }

  privateMessage(message, destinationId) {
    this.mqttHandler.publish(
      `chat/${this.id}/${destinationId}`,
      JSON.stringify(message)
    );
  }
}
module.exports = Chat;
