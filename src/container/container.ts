import { Container as InversifyContainer, interfaces as inversifyInterfaces } from "inversify";
import { ComponentRegistry } from "../component/registry";
import debug from "../debug-config";
import * as interfaces from "../interfaces/interfaces";

import { descriptor as coreComponentDescriptor } from "../core-component/descriptor";

export class Container implements interfaces.Container {
  readonly inversifyInstance: inversifyInterfaces.Container;
  readonly componentRegistry: interfaces.ComponentRegistry;
  private mainApp: interfaces.MainApplication;

  constructor() {
    this.inversifyInstance = new InversifyContainer();
    this.componentRegistry = new ComponentRegistry();
    this.bindFrameworkComponent();
  }

  public setMainApplication(app: interfaces.MainApplication) {
    debug("Setting main application to %o", app);
    this.mainApp = app;
  }

  public runMain() {
    debug("Executing main application...");
    return this.mainApp.execute(this);
  }

  // TODO: Remove this, put into own package
  private bindFrameworkComponent() {
    this.componentRegistry.addFromDescriptor(coreComponentDescriptor);
  }
}
