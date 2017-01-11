import { Container as InversifyContainer, interfaces as inversifyInterfaces, inject } from "inversify";
import * as interfaces from "../interfaces/interfaces";

// TODO: Rename EXTENSION to COMPONENTS, SERVICE to SERVICECOMPONENTS.
// What they NEED = INJECT()s, what they GIVE = Extensions and Services

export class Container implements interfaces.Container {
  private inversifyContainer: inversifyInterfaces.Container;
  private mainAppExtension = Symbol();

  constructor() {
    this.inversifyContainer = new InversifyContainer();
  }

  public getInversifyInstance() {
    return this.inversifyContainer;
  }

  public bindExtension(extensionPoint: symbol, extensionClass: { new (...args: any[]): interfaces.Extension; }) {
    return this.getInversifyInstance().bind<interfaces.Extension>(extensionPoint).to(extensionClass);
  }

  public bindService<T>(identifier: symbol) {
    return this.getInversifyInstance().bind<T>(identifier);
  }

  public getExtension(extensionPoint: symbol) {
    return this.getInversifyInstance().get<interfaces.Extension>(extensionPoint);
  }

  public setMainApplication(extensionClass: { new (...args: any[]): interfaces.Extension; }) {
    this.bindExtension(this.mainAppExtension, extensionClass);
  }

  public runMain() {
    this.getExtension(this.mainAppExtension).execute();
  }
}
