import { Component, ComponentBinder as ComponentBinderInterface, Container, ExecutableExtension, BindableContainer } from "../interfaces/interfaces";
import { interfaces as inversifyInterfaces } from "inversify";

export class ComponentBinder implements ComponentBinderInterface {
  constructor(private componentName: string, private container: BindableContainer) {}

  bindLocalServiceToSelf<T>(service: { new (...args: any[]): T; }) {
    return this.container.bind(service).toSelf();
  }

  bindLocalService<T>(serviceSymbol: symbol) {
    return this.container.bind<T>(serviceSymbol);
  }

  bindGlobalService<T>(serviceName: string) {
    return this.container.bind<T>(this.componentName + ":" + serviceName);
  }

  bindExtension<T>(extensionPoint: symbol) {
    return this.container.bind<T>(extensionPoint);
  }

  bindExecutable(extensionPoint: symbol, extensionClass: { new (...args: any[]): ExecutableExtension; }) {
    return this.bindExtension<ExecutableExtension>(extensionPoint).to(extensionClass);
  }
}
