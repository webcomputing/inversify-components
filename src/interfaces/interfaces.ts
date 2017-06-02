import { interfaces as inversifyInterfaces } from "inversify";

// TODO: Rename "extension points" to "component interfaces" in many implementations

// Basic extension interface to implement
export interface ExecutableExtension {
  execute(): any;
}

export interface Message {
  componentInterface: symbol;
  [key: string]: any;
}

export interface MessageHandler {
  (message: Message): void;
}

export interface MessageBus {
  on(componentInterface: symbol, handler: MessageHandler);
  emit(message: Message);
}

/* Basic Interfaces for Hooks */
// TODO: Put this into own package!
export namespace Hooks {
  export interface PipeFactory {
    (componentInterface: symbol): Hooks.Pipe;
  }

  export enum ExecutionMode {
    Filter,
    ResultSet
  }

  export interface ContinuationFunction {
    (result?: any): void;
  }

  export interface Hook {
    (success: ContinuationFunction, failure: ContinuationFunction, mode: ExecutionMode, ...args: any[]): void;
  }

  export interface ExecutionResult {
    hook: Hook;
    result: any;
  }

  export interface PipeOnFilterFinish {
    (hooks: ExecutionResult[], ...passedArguments: any[]): void;
  }

  export interface PipeOnResultsetFinish {
    (successfulHooks: ExecutionResult[], unsuccessfulHooks: ExecutionResult[], ...passedArguments: any[]): void;
  }

  export interface Pipe {
    /** List containing all available hooks */
    hooks: Hook[];

    /** 
     * withArguments()
     * Returns a new HookPipe based on this one, but with given arguments
     * Implements immutable pattern (see Java String) 
     */
    withArguments(...args: any[]): Pipe;

    /** 
     * runAsFilter()
     * Runs all hooks in this pipe as filter, which means onFinish is only called if all hooks called "success(result: any)".
     * As soon as one hook answers with failure(), no other hooks are executed anymore, in that case, onFailure() is called, if given.
     */
    runAsFilter(onFinish: PipeOnFilterFinish, onFailure?: PipeOnResultsetFinish): void;

    /** 
     * runWithResultset()
     * Runs all hooks and calls onFinish afterwards.
     */
    runWithResultset(onFinish: PipeOnResultsetFinish): void;
  }
}

// If you register your component, you will get an instance of this.
// Every component must have a name, so we need it in the constructor.
// After setting, the name is not changable anymore. You set the name via the
// ComponentDescriptor.
export interface Component {
  readonly name: string;
  readonly interfaces: InterfaceDescriptor;
  getInterface(name: string): symbol;
  configuration: {};
  addConfiguration(configuration: {}): void;
}

// General interface to bind sth via dependency injection
export interface ComponentBinder {
  /**
   * Use this method if you want to bind a service locally.
   * @param serviceSymbol:symbol Use a (more or less) secret symbol which is not exposed to 
   * the component registry (in contrast to component interfaces). Only your component should be 
   * able to read it.
   */
  bindLocalService<T>(serviceIdentifier: symbol): inversifyInterfaces.BindingToSyntax<T>;

  /**
   * Same as bindLocalService(), but you don't need a symbol, use the class itself as identifier and bind directly to it
   */
  bindLocalServiceToSelf<T>(service: { new (...args: any[]): any; }): inversifyInterfaces.BindingInWhenOnSyntax<T>;

  /**
   * Use this to expose a service to the whole environment.
   * @param serviceName Your service will be available via componentName:serviceName
   */
  bindGlobalService<T>(serviceName: string): inversifyInterfaces.BindingToSyntax<T>;
  bindExtension<T>(componentInterface: symbol): inversifyInterfaces.BindingToSyntax<T>;
  bindExecutable(componentInterface: symbol, extensionClass: { new (...args: any[]): ExecutableExtension; }): inversifyInterfaces.BindingWhenOnSyntax<ExecutableExtension>;
}

// This is the method you get to describe your component on initialization
// First, you define name and interfaces, then, in a callback, you define your
// own consumptions / bindings.
export interface ComponentDescriptor {
  name: string;
  interfaces?: InterfaceDescriptor;
  defaultConfiguration?: {};
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
  executeBinding(componentName: string, container: BindableContainer, scope?: string, ...args: any[]): void;
  autobind(container: BindableContainer, except?: string[], scope?: string, ...args: any[]): void;
  getBinder(componentName: string, container: BindableContainer): ComponentBinder;
}

export interface MainApplication {
  execute(container: Container): void;
}

// Main container class
export interface Container {
  readonly componentRegistry: ComponentRegistry;
  readonly inversifyInstance: inversifyInterfaces.Container;
  setMainApplication(app: MainApplication): void;
  runMain(): void;
}

export interface BindableContainer {
  bind<T>(serviceIdentifier: inversifyInterfaces.ServiceIdentifier<T>): inversifyInterfaces.BindingToSyntax<T>;
}

// Helper interfaces for callbacks and so on..

// Define how to bindings between symbol an

export interface BindingDescriptor {
  root: ScopedBindingDescriptor;
  [name: string]: ScopedBindingDescriptor;
}

export interface ScopedBindingDescriptor {
  (bindService: ComponentBinder, lookupService: LookupService, ...args: any[]): void;
}

export interface InterfaceDescriptor {
  [name: string]: symbol;
}