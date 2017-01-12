import { ComponentRegistry as ComponentRegistryInterface, Component, Container, ComponentDescriptor, BindingDescriptor } from "../interfaces/interfaces";
import { ComponentBinder } from "./binder";
import { Component as ComponentImpl } from "./component";

export class ComponentRegistry implements ComponentRegistryInterface {
  readonly _registeredComponents: { [name: string]: Component} = {};
  private registeredBindings: { [componentName: string]: BindingDescriptor};

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

  addFromDescriptor(descriptor: ComponentDescriptor) {
    this.add(new ComponentImpl(descriptor.name, descriptor.extensionPoints));
    this.registeredBindings[descriptor.name] = descriptor.bindings;
  }

  areAllExtensionsValid() {
    return true;
  }

  autobind(container: Container, except = []) {
    Object.keys(this.registeredBindings).filter(k => except.indexOf(k) !== -1).forEach(componentName => {
      this.registeredBindings[componentName](this.getBinder(componentName, container), this);
    });
  }
}
