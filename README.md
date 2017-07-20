# inversify-components
Small framework on top of InversifyJS to enable component based dependency injection. 
Each component describes its interfaces and bindings with the help of descriptors, and never 
accesses the dependency injection container directly. This enables you to:
- Develop loosely coupled and independent components, without exploiting your whole dependency injection container
- Enable / disable / mock whole components in your application
- Use scoped child containers, for example bind dependencies only to a http request
- Implement the extension point pattern to "plug-in" extensions of components from other components

## Installation
Install inversify-components and set it as an dependency in your local package.json:

``npm i --save inversify-components``

## Usage

### Basic setup instructions

1) Create the inversify-components container:
```typescript
import { ContainerImpl } from "inversify-components";
let container = new ContainerImpl();
```

2) Create your main application, which acts as the [composition root][1]:
```typescript
import { MainApplication } from "inversify-components";

class App implements MainApplication {
  execute(container: Container) {
    // Start your application using the container!
  }
}
```

3) Register all _components_ (see below) you would like to use:
```typescript
import { descriptor } from "my-component-descriptor";
container.componentRegistry.addFromDescriptor(descriptor);
```

4) Register all bindings of all registered component descriptors
```typescript
container.componentRegistry.autobind(container.inversifyInstance);
```

5) Optional: Configure some of your components:
```typescript
container.componentRegistry.lookup(nameOfComponent).addConfiguration({
  configurationKey: "configurationValue"
});
```

6) Start your application
```typescript
container.setMainApplication(new App());
container.runMain();
```

### Components and component descriptors
inversify-components allows you to basically split your applications into independent components. Each component does not have
direct access to the dependency injection container, but still is enabled to bind it's services. To do so, each component exports
a `component descriptor`:
```typescript
import { ComponentDescriptor } from "inversify-components";

export const descriptor: ComponentDescriptor = {
  name: "name-of-component", // This must be unique for all registered components
  bindings: {
    root: (bindService, lookupService) => {
      // Binding of services is very similar to inversifyJS:
      bindService.bindGlobalService<TypeOfService>("service-name").to(MyServiceClass);
      
      // MyServiceClass is now bound to "name-of-component:service-name" and available in all other components.
    }
  }
};
```
Notice that each binding gets the unique component name as a prefix. This guarantees that there are not duplicate service bindings
across all registered components.

#### Changing the scope of a binding
The above component descriptor executes bindings for the `root` scope. This is the default scope for inversify-components, which
is executed automatically at `autobind`. But you could also register bindings for a specific scope, and execute this scope 
at application runtime to a specific point in time:
```typescript
import { ComponentDescriptor } from "inversify-components";

export const descriptor: ComponentDescriptor = {
  name: "name-of-component",
  bindings: {
    root: (bindService, lookupService) => {
      bindService.bindGlobalService<TypeOfService>("service-name").to(MyServiceClass);
    }
    request: (bindService, lookupService) => {
      // Is not available at application start, but as soon as you open your "request" scope:
      bindService.bindGlobalService<TypeOfService>("current-session").toDynamicValue(....);
    }
  }
};

// In your MainApplication / App, as soon as you would like to open the above "request" scope:
// 1) Create inversify child container
let scopedRequestContainer = container.inversifyInstance.createChild();

// 2) Possibly bind some dependent values to this container, e. g. the current request headers and body:
scopedRequestContainer.bind("request-body").toConstantValue(currentRequestBody);

// 3) Execute scoped "request" bindings in this container
container.componentRegistry.autobind(scopedRequestContainer, [], "request");

// 4) Go on in your compoisiton root with child container
scopedRequestContainer.get(...) // Maybe your request handler?
```

#### Using extension points
To enable plugging into your component, you can define _extension points_. This is done using symbols.

Component A: The component which owns the extension point and wants to load plugins:
```typescript
import { ComponentDescriptor } from "inversify-components";
import { injectable, multiInject, optional } from "inversify";

const myExtensionPoints = {
  "firstExtensionPoint": Symbol("first-extension-point")
}

export const descriptor: ComponentDescriptor = {
  name: "component-a",
  
  // Register all available extension points
  interfaces: myExtensionPoints
};

@injectable()
class ClassUsingPlugins {
  // Now you can just inject all plugins registered at firstExtensionPoint and use them:
  constructor(@optional() @multiInject(myExtensionPoints.firstExtensionPoint) plugins) {
    this.plugins = plugins;
  }
}
```

Component B: The component which adds a plugin to extension point firstExtensionPoint:
```typescript
export const descriptor: ComponentDescriptor = {
  name: "component-b",
  bindings: {
    root: (bindService, lookupService) => {
      let extensionPoint = lookupService.lookup("component-a").getInterface("firstExtensionPoint");
      bindService.bindExtension<ExtensionType>(extensionPoint).to(MyPluginClass);
    }
  }
};
```
[1]: http://blog.ploeh.dk/2011/07/28/CompositionRoot/
