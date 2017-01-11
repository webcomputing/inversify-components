import { ComponentRegistry as ComponentRegistryInterface, Component, Container } from "../interfaces/interfaces";
import { ComponentBinder } from "./binder";

export class ComponentRegistry implements ComponentRegistryInterface {
  readonly _registeredComponents: { [name: string]: Component} = {};

  get registeredComponents () {
    return this.registeredComponents;
  }

  getBinder(name: string, container: Container) {
    return new ComponentBinder(this.lookup(name), container);
  }

  lookup(componentName: string): Component {
    if (!this.isRegistered(componentName)) {
      throw new Error("Looked up component " + componentName + "was not found!");
    }

    return this.registeredComponents[componentName];
  }

  isRegistered(componentName: string): boolean {
    return componentName in this._registeredComponents;
  }

  add(component: Component): void {
    if (this.isRegistered(component.name)) {
      throw new Error("Component " + component.name + " is already registered!");
    }

    this._registeredComponents[component.name] = component;
  }
}
