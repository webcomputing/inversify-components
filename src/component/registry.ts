import { ComponentRegistry as ComponentRegistryInterface, Component, Container, ComponentDescriptor, BindingDescriptor } from "../interfaces/interfaces";
import { ComponentBinder } from "./binder";
import { Component as ComponentImpl } from "./component";
import debug from "../debug-config";

export class ComponentRegistry implements ComponentRegistryInterface {
  readonly registeredComponents: { [name: string]: Component} = {};
  private registeredBindings: { [componentName: string]: BindingDescriptor} = {};

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
    return componentName in this.registeredComponents;
  }

  add(component: Component): void {
    if (this.isRegistered(component.name)) {
      throw new Error("Component " + component.name + " is already registered!");
    }

    debug("Adding component " + component.name + " to registry..");
    this.registeredComponents[component.name] = component;
  }

  addFromDescriptor(descriptor: ComponentDescriptor) {
    let extensionPoints = descriptor.hasOwnProperty("extensionPoints") ? descriptor.extensionPoints : {};
    this.add(new ComponentImpl(descriptor.name, extensionPoints));

    debug("Registering bindings for " + descriptor.name + "..");
    this.registeredBindings[descriptor.name] = descriptor.bindings;
  }

  executeBinding(componentName: string, container: Container) {
    debug("Executing bindings for " + componentName + "..");
    this.registeredBindings[componentName](this.getBinder(componentName, container), this);
  }

  autobind(container: Container, except = []) {
    debug("Autobind started with exceptions = %j", except);
    Object.keys(this.registeredBindings)
      .filter(k => except.indexOf(k) === -1)
      .forEach(componentName => this.executeBinding(componentName, container));
    debug("Autobind finished");
  }
}
