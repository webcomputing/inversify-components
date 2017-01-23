import { MessageBus } from "./message-bus";
import { MessageBus as MessageBusInterface, Message } from "../interfaces/interfaces";
import { injectable, inject } from "inversify";

@injectable()
export class LocalMessageBus extends MessageBus {
  @inject("core:root-message-bus")
  private root: MessageBusInterface;

  emit(message: Message) {
    super.emit(message);
    this.root.emit(message);
  }
}