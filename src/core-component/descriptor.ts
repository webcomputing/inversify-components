import { ComponentDescriptor, Hooks } from "../interfaces/interfaces";
import { interfaces as inversifyInterfaces } from "inversify";
import { HookPipe } from "./hook-pipe";

export const descriptor: ComponentDescriptor = {
  name: "core",
  bindings: (bindService, lookupService) => {
    bindService.bindGlobalService<Hooks.PipeFactory>("hook-pipe").toFactory<Hooks.Pipe>(context => {
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