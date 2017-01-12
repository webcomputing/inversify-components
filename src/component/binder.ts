import { Component, ComponentBinder as ComponentBinderInterface, Container, ExecutableExtension } from "../interfaces/interfaces";
import { interfaces as inversifyInterfaces } from "inversify";

export class ComponentBinder implements ComponentBinderInterface {
  private component: Component;
  private container: Container;

  constructor(component: Component, container: Container) {
    this.component = component;
    this.container = container;
  }

  public bind<T>(identifier: string) {
    return this.container.bind<T>(this.component.name + ":" + identifier);
  }

  public bindExecutable(extensionPoint: string, extensionClass: { new (...args: any[]): ExecutableExtension; }) {
    return this.bind<ExecutableExtension>(extensionPoint).to(extensionClass);
  }
}
