import { Component, ComponentBinder as ComponentBinderInterface, Container, ExecutableExtension } from "../interfaces/interfaces";
import { interfaces as inversifyInterfaces } from "inversify";

export class ComponentBinder implements ComponentBinderInterface {
  private component: Component;
  private container: Container;

  constructor(component: Component, container: Container) {
    this.component = component;
    this.container = container;
  }

  bindExtension<T>(extensionPoint: symbol) {
    return this.container.bind<T>(extensionPoint);
  }

  bindExecutable(extensionPoint: symbol, extensionClass: { new (...args: any[]): ExecutableExtension; }) {
    return this.bindExtension<ExecutableExtension>(extensionPoint).to(extensionClass);
  }
}
