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

  /** 
   * Function which intercepts into a given workflow. Based on execution mode and return of the hook, the workflow might be interrupted.
   * @param {ExecutionMode} mode execution mode of this hook. If set to filter, your hook function is able to intercept the workflow
   * @param args all additional arguments passed to the hook function
   * @return {Promise<HookResult | boolean> | HookResult | boolean} true / false if the workflow should be interrupted, or HookResult for more complex responses
   */
  export interface Hook {
    (mode: ExecutionMode, ...args: any[]): Promise<HookResult | boolean> | HookResult | boolean;
  }

  /** Possible result set of your hook function */
  export interface HookResult {
    /** Set to false to intercept the workflo */
    success: boolean;
    result?: any;
  }

  export interface ExecutionResult {
    hook: Hook;
    result: any;
  }

  export interface ExecutionSummary {
    /** If all hooks were successfully executed */
    success: boolean;

    /** List of successfully executed hooks */
    successfulHooks: ExecutionResult[];

    /** List of failed hooks */
    failedHooks: ExecutionResult[];

    /** Arguments passed to hook functions */
    arguments: any[];
  }

  export interface Pipe {
    /** List containing all available hooks */
    hooks: Hook[];

    /** 
     * withArguments()
     * Returns a new HookPipe based on this one, but with given arguments
     * Implements immutable pattern
     */
    withArguments(...args: any[]): Pipe;

    /** 
     * runAsFilter()
     * Runs all hooks in this pipe as filter. If one hook fails, all following hooks are not executed anymore.
     */
    runAsFilter(): Promise<Hooks.ExecutionSummary>;

    /** 
     * runWithResultset()
     * Runs all hooks regardless of each's return value.
     */
    runWithResultset(): Promise<Hooks.ExecutionSummary>;
  }
}

// If you register your component, you will get an instance of this.
// Every component must have a name, so we need it in the constructor.
// After setting, the name is not changable anymore. You set the name via the
// ComponentDescriptor.
export interface Component< Configuration = {} > {
  readonly name: string;
  readonly interfaces: InterfaceDescriptor;
  getInterface(name: string): symbol;
  configuration: Configuration;
  addConfiguration(configuration: Partial<Configuration>): void;
};

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
export interface ComponentDescriptor<OptionalConfiguration={}> {
  name: string;
  interfaces?: InterfaceDescriptor;
  defaultConfiguration?: OptionalConfiguration;
  bindings: BindingDescriptor;
}

// To lookup a component (to get its meta data like extension points)
export interface LookupService {
  lookup<Configuration={}>(componentName: string): Component<Configuration>;
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
  (bindService: ComponentBinder, lookupService: LookupService, inversifyInstance: inversifyInterfaces.Container, ...args: any[]): void;
}

export interface InterfaceDescriptor {
  [name: string]: symbol;
}