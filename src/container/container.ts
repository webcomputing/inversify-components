import { Container as InversifyContainer, interfaces as inversifyInterfaces } from "inversify";
import { ComponentRegistry } from "../component/registry";
import debug from "../debug-config";
import * as interfaces from "../interfaces/interfaces";

import { descriptor as coreComponentDescriptor } from "../core-component/descriptor";

export class Container implements interfaces.Container {
  readonly inversifyInstance: inversifyInterfaces.Container;
  readonly componentRegistry: interfaces.ComponentRegistry;
  private mainAppExtension = Symbol();

  constructor() {
    this.inversifyInstance = new InversifyContainer();
    this.componentRegistry = new ComponentRegistry();
    this.bindFrameworkComponent();
  }

  public bind<T>(identifier: any) {
    debug("Container tells inversify to bind to %o", identifier);
    return this.inversifyInstance.bind<T>(identifier);
  }

  public setMainApplication(extensionClass: { new (...args: any[]): interfaces.ExecutableExtension; }) {
    debug("Setting main application to %o", extensionClass);
    this.inversifyInstance.bind<interfaces.ExecutableExtension>(this.mainAppExtension).to(extensionClass);
  }

  public runMain() {
    debug("Executing main application...");
    this.inversifyInstance.get<interfaces.ExecutableExtension>(this.mainAppExtension).execute();
  }

  // TODO: Remove this, put into own package
  private bindFrameworkComponent() {
    this.componentRegistry.addFromDescriptor(coreComponentDescriptor);
  }
}
