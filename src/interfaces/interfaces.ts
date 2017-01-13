import { interfaces as inversifyInterfaces } from "inversify";

// Basic extension interface to implement
export interface ExecutableExtension {
  execute(): any;
}

// If you register your component, you will get an instance of this.
// Every component must have a name, so we need it in the constructor.
// After setting, the name is not changable anymore. You set the name via the
// ComponentDescriptor.
export interface Component {
  readonly name: string;
  readonly extensionPoints: { [name: string]: symbol };
  getExtensionPoint(name: string): symbol;
}

// General interface to bind sth via dependency injection
export interface ComponentBinder {
  bindExtension<T>(extensionPoint: symbol): inversifyInterfaces.BindingToSyntax<T>;
  bindExecutable(extensionPoint: symbol, extensionClass: { new (...args: any[]): ExecutableExtension; }): inversifyInterfaces.BindingWhenOnSyntax<ExecutableExtension>;
}

// This is the method you get to describe your component on initialization
// First, you define name and extension points, then, in a callback, you define your
// own consumptions / bindings.
export interface ComponentDescriptor {
  name: string;
  extensionPoints?: { [name: string]: symbol };
  bindings: BindingDescriptor;
}

// To lookup a component (to get its meta data like extension points)
export interface LookupService {
  lookup(componentName: string): Component;
  isRegistered(componentName: string): boolean;
}

export interface ComponentRegistry extends LookupService {
  readonly registeredComponents: { [name: string]: Component};
  add(component: Component): void;
  addFromDescriptor(descriptor: ComponentDescriptor): void;
  autobind(container: Container, except?: string[]): void;
  getBinder(componentName: string, container: Container): ComponentBinder;
}

// Main container class
export interface Container {
  readonly componentRegistry: ComponentRegistry;
  readonly inversifyInstance: inversifyInterfaces.Container;
  setMainApplication(extensionClass: { new (...args: any[]): ExecutableExtension; }): void;
  bind<T>(identifier: any): inversifyInterfaces.BindingToSyntax<T>;
  runMain(): void;
}

// Helper interfaces for callbacks and so on..

// Define how to bindings between symbol an
export interface BindingDescriptor {
  (bindService: ComponentBinder, lookupService: LookupService): void;
}
