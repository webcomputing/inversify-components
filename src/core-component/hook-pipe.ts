import { Hooks } from "../interfaces/interfaces";

export class HookPipe implements Hooks.Pipe {
  private _hooks: Hooks.Hook[];
  private _arguments: any[];

  constructor(hooks: Hooks.Hook[], args: any[] = []) {
    this._hooks = hooks;
    this._arguments = args;
  }

  get arguments(): any[] {
    return this._arguments;
  }

  get hooks(): Hooks.Hook[] {
    return this._hooks;
  }

  withArguments(...args: any[]) {
    return new HookPipe(this.hooks, this.arguments);
  }

  runAsFilter(onFinish: Hooks.PipeOnFilterFinish, onFailure?: Hooks.PipeOnResultsetFinish) {
    let resultSet: Hooks.ExecutionResult[] = [];
    this.executeAll(true, Hooks.ExecutionMode.Filter, (successful, failed) => {
      if (failed.length > 0 && typeof(onFailure) !== "undefined") {
        onFailure(successful, failed, this.arguments);
      } else if (failed.length === 0) {
        onFinish(successful, this.arguments);
      }
    });
  }

  runWithResultset(onFinish: Hooks.PipeOnResultsetFinish) {
    this.executeAll(false, Hooks.ExecutionMode.ResultSet,
      (successful, failed) => onFinish(successful, failed, this.arguments));
  }

  private executeWithResultset(hookIndex: number, executionMode: Hooks.ExecutionMode, withResultset: (success: boolean, resultset: Hooks.ExecutionResult) => void): void {
    this.hooks[hookIndex](successResult => {
      withResultset(true, {hook: this.hooks[hookIndex], result: successResult});
    }, failResult => {
      withResultset(false, {hook: this.hooks[hookIndex], result: failResult});
    }, executionMode, this.arguments);
  }

  private executeAll(stopOnFailure: boolean, executionMode: Hooks.ExecutionMode, onFinish: (successful: Hooks.ExecutionResult[], failed: Hooks.ExecutionResult[]) => void) {
    let successful, failed: Hooks.ExecutionResult[] = [];

    let repeater = (i: number) => {
      if (typeof(this.hooks[i]) === "undefined") return onFinish(successful, failed);

      this.executeWithResultset(i, executionMode, (wasSuccessful, result) => {
        if (wasSuccessful) {
          successful.push(result);
        } else {
          failed.push(result);
        }

        if (!wasSuccessful && stopOnFailure) {
          return onFinish(successful, failed);
        } else {
          repeater(i + 1);
        }
      });
    };

    // Start the loop with first hook
    repeater(0);
  }
}