import { ComponentDescriptor, Hooks, LookupService, MessageBus } from "../interfaces/interfaces";
import { interfaces as inversifyInterfaces } from "inversify";
import { HookPipe } from "./hook-pipe";
import { MessageBus as MessageBusImpl } from "./message-bus";

export const descriptor: ComponentDescriptor = {
  name: "core",
  bindings: (bindService, lookupService) => {
    // Make lookupService available as global service 
    bindService.bindGlobalService<LookupService>("lookup-service").toConstantValue(lookupService);

    // Make message bus available as singleton global service 
    bindService.bindGlobalService<MessageBus>("message-bus").to(MessageBusImpl).inSingletonScope();

    // Bind Hook Pipielines with factory
    bindService.bindGlobalService<Hooks.PipeFactory>("hook-pipe-factory").toFactory<Hooks.Pipe>(context => {
      return (hooksExtensionPoint: symbol) => {
        let hooks: Hooks.Hook[] = [];

        if (context.container.isBound(hooksExtensionPoint)) {
          hooks = context.container.getAll<Hooks.Hook>(hooksExtensionPoint);
        }

        return new HookPipe(hooks);
      };
    });
  }
};