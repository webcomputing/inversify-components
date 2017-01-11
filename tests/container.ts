import { Container } from "../src/container/container";
import * as interfaces from "../src/interfaces/interfaces";
import { injectable, inject, multiInject } from "inversify";
import "reflect-metadata";

interface PlatformExtension extends interfaces.Extension {
  fits(): boolean;
}

const extensionPoints = {
  platform: Symbol(),

  mainApplication: Symbol()
};

@injectable()
class PlatformManager implements interfaces.Extension {

  @multiInject(extensionPoints.platform)
  private extensions: PlatformExtension[] = [];

  public execute(): void {
    console.log("Platform manager is running!", this.extensions);

    let runnableExtensions = this.extensions.filter((extensionPoint) => { return extensionPoint.fits() });
    if (runnableExtensions.length > 1) throw new TypeError("Multiple extensions fit to this request!");

    runnableExtensions[0].execute();
  }
}

@injectable()
class Alexa implements PlatformExtension {

  fits(): boolean {
    console.log("Checking on AlexaPlatform!");
    return true;
  }

  execute(): void {
    console.log("Executed on AlexaPlatform!");
  }
}

// Do the bindings
let container = new Container();

container.bindExtension(extensionPoints.mainApplication, PlatformManager);
container.bindExtension(extensionPoints.platform, Alexa);

container.getExtension(extensionPoints.mainApplication).execute();
