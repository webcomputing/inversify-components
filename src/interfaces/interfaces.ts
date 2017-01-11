import { interfaces as inversifyInterfaces } from "inversify";

export interface Extension {
  execute(): any;
}

export interface Container {
  getInversifyInstance(): inversifyInterfaces.Container;
  bindExtension(extensionPoint: symbol, extensionClass: { new (...args: any[]): Extension; }): inversifyInterfaces.BindingWhenOnSyntax<Extension>;
  bindService<T>(identifier: symbol): inversifyInterfaces.BindingToSyntax<T>;
  getExtension(extensionPoint: symbol): Extension;
  setMainApplication(extensionClass: { new (...args: any[]): Extension; }): void;
  runMain(): void;
}

export interface ComponentRegistration {
  (): void;
}
