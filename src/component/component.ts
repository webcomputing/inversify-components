import { Component as ComponentInterface } from "../interfaces/interfaces";

export class Component implements ComponentInterface {
  readonly name: string;
  readonly extensionPoints: string[];

  constructor(name: string, extensionPoints: string[] = []) {
    this.name = name;
    this.extensionPoints = extensionPoints;
  }
}
