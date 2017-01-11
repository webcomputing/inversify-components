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
  readonly extensionPoints: string[];
  // TODO: readonly consumes: string[]; - currently only in concept
}

// General interface to bind sth via dependency injection
export interface ComponentBinder extends GeneralBind {
  bindExecutable(extensionPoint: string, extensionClass: { new (...args: any[]): ExecutableExtension; }): inversifyInterfaces.BindingWhenOnSyntax<ExecutableExtension>;
}

// This is the method you get to describe your component on initialization
// First, you define name and extension points, then, in a callback, you define your
// own consumptions / bindings.
export interface ComponentDescriptor {
  name: string;
  extensionPoints: string[];
  bindings: BindingDescriptor;
}

// To lookup a component (to get its meta data like extension points)
export interface LookupService {
  lookup(componentName: string): Component;
  isRegistered(componentName: string): boolean;
}

export interface ComponentRegistry extends LookupService {
  readonly _registeredComponents: { [name: string]: Component};
  add(component: Component): void;
  getBinder(componentName: string, container: Container): ComponentBinder;
}

// Main container class
export interface Container extends GeneralBind {
  readonly componentRegistry: ComponentRegistry;
  readonly inversifyInstance: inversifyInterfaces.Container;
  setMainApplication(extensionClass: { new (...args: any[]): ExecutableExtension; }): void;
  runMain(): void;
}

// Helper interfaces for callbacks and so on..

// Define how to bindings between symbol an
interface BindingDescriptor {
  (bindService: ComponentBinder, lookupService: LookupService): void;
}

interface GeneralBind {
  bind<T>(extensionPoint: string): inversifyInterfaces.BindingToSyntax<T>;
}
