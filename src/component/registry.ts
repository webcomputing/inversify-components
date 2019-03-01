import { cloneDeep } from "lodash";

import { interfaces as inversifyInterfaces } from "inversify";
import {
  ComponentRegistry as ComponentRegistryInterface,
  Component,
  Container,
  ComponentDescriptor,
  BindingDescriptor,
  LookupService,
  BindableContainer,
} from "../interfaces/interfaces";
import { ComponentBinder } from "./binder";
import { Component as ComponentImpl } from "./component";
import debug from "../debug-config";

export class ComponentRegistry implements ComponentRegistryInterface, LookupService {
  readonly registeredComponents: { [name: string]: Component } = {};
  private registeredBindings: { [componentName: string]: BindingDescriptor } = {};

  getBinder(name: string, container: BindableContainer) {
    return new ComponentBinder(this.lookup(name).name, container);
  }

  lookup<Config = {}>(componentName: string): Component<Config> {
    if (!this.isRegistered(componentName)) {
      throw new Error("Looked up component " + componentName + "was not found!");
    }

    return this.registeredComponents[componentName] as Component<Config>;
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
    let interfaces = descriptor.hasOwnProperty("interfaces") ? descriptor.interfaces : {};
    let defaultConfig = descriptor.hasOwnProperty("defaultConfiguration") ? cloneDeep(descriptor.defaultConfiguration) : {};
    this.add(new ComponentImpl(descriptor.name, interfaces, defaultConfig));

    debug("Registering bindings for " + descriptor.name + "..");
    this.registeredBindings[descriptor.name] = descriptor.bindings;
  }

  executeBinding(componentName: string, container: inversifyInterfaces.Container, scope = "root", ...args: any[]) {
    if (typeof this.registeredBindings[componentName] === "undefined" || typeof this.registeredBindings[componentName][scope] === "undefined") return;
    debug("Executing bindings for " + componentName + " in scope = " + scope + "..");

    if (scope === "root") {
      container.bind<Component>("meta:component//" + componentName).toConstantValue(this.registeredComponents[componentName]);
    }
    this.registeredBindings[componentName][scope](this.getBinder(componentName, container), this, container, ...args);
  }

  autobind(container: inversifyInterfaces.Container, except = [], scope = "root", ...args: any[]) {
    debug("Autobind started with exceptions = %j in scope " + scope, except);
    Object.keys(this.registeredBindings)
      .filter(k => except.indexOf(k) === -1)
      .forEach(componentName => this.executeBinding(componentName, container, scope, ...args));
    debug("Autobind finished");
  }
}
