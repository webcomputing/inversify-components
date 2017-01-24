import { MessageBus as MessageBusInterface, Message, MessageHandler } from "../interfaces/interfaces";
import { injectable } from "inversify";

@injectable()
export class MessageBus implements MessageBusInterface {
  private registry: {identifier: symbol, handler: MessageHandler}[] = [];

  emit(message: Message) {
    this.registry
      .filter(registered => registered.identifier === message.componentInterface)
      .forEach(registered => registered.handler(message));
  }

  on(componentIdentifier: symbol, handler: MessageHandler) {
    this.registry.push({identifier: componentIdentifier, handler: handler});
  }
}