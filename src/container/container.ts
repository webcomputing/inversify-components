import { Container as InversifyContainer, interfaces as inversifyInterfaces } from "inversify";
import { ComponentRegistry } from "../component/registry";
import * as interfaces from "../interfaces/interfaces";

export class Container implements interfaces.Container {
  readonly inversifyInstance: inversifyInterfaces.Container;
  readonly componentRegistry: interfaces.ComponentRegistry;
  private mainAppExtension = Symbol();

  constructor() {
    this.inversifyInstance = new InversifyContainer();
    this.componentRegistry = new ComponentRegistry();
  }

  public bind<T>(identifier: string) {
    return this.inversifyInstance.bind<T>(identifier);
  }

  public setMainApplication(extensionClass: { new (...args: any[]): interfaces.ExecutableExtension; }) {
    this.inversifyInstance.bind<interfaces.ExecutableExtension>(this.mainAppExtension).to(extensionClass);
  }

  public runMain() {
    this.inversifyInstance.get<interfaces.ExecutableExtension>(this.mainAppExtension).execute();
  }
}
