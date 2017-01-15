import { Component as ComponentInterface, ExtensionPointDescriptor, Configuration } from "../interfaces/interfaces";

export class Component implements ComponentInterface {
  readonly name: string;
  readonly extensionPoints: ExtensionPointDescriptor;
  private _configuration: Configuration;

  get configuration() {
    return this._configuration;
  }

  constructor(name: string, extensionPoints: ExtensionPointDescriptor = {}, configuration: Configuration = {}) {
    this.name = name;
    this.extensionPoints = extensionPoints;
    this._configuration = configuration;
  }

  getExtensionPoint(name: string) {
    if (!this.extensionPoints.hasOwnProperty(name)) {
      throw new Error("Component " + this.name + " does not offer extension point " + name);
    }

    return this.extensionPoints[name];
  }

  addConfiguration(c: Configuration) {
    this._configuration = Object.assign(this._configuration, c);
  }
}
