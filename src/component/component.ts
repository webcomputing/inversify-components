import { Component as ComponentInterface } from "../interfaces/interfaces";

export class Component implements ComponentInterface {
  readonly name: string;
  readonly extensionPoints: { [name: string]: symbol } = {};

  constructor(name: string, extensionPoints: { [name: string]: symbol }) {
    this.name = name;
    this.extensionPoints = extensionPoints;
  }

  getExtensionPoint(name: string) {
    if (!this.extensionPoints.hasOwnProperty(name)) {
      throw new Error("Component " + this.name + " does not offer extension point " + name);
    }

    return this.extensionPoints[name];
  }
}
