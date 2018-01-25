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
    return new HookPipe(this.hooks, args);
  }

  async runAsFilter(): Promise<Hooks.ExecutionSummary> {
    const resultSet: Hooks.ExecutionResult[] = [];

    const resultList = await this.executeAll(true, Hooks.ExecutionMode.Filter);
    return { "success": resultList.failed.length === 0, "successfulHooks": resultList.successful, "failedHooks": resultList.failed, arguments: this.arguments };
  }

  async runWithResultset(): Promise<Hooks.ExecutionSummary> {
    const resultList = await this.executeAll(false, Hooks.ExecutionMode.ResultSet);
    return { "success": resultList.failed.length === 0, "successfulHooks": resultList.successful, "failedHooks": resultList.failed, arguments: this.arguments };
  }

  private async executeWithResultset(hookIndex: number, executionMode: Hooks.ExecutionMode): Promise<Hooks.HookResult> {
    const hookResult = await Promise.resolve(this.hooks[hookIndex](executionMode, ...this.arguments));
    return typeof hookResult === "boolean" ? { success: hookResult } : hookResult;
  }

  private async executeAll(stopOnFailure: boolean, executionMode: Hooks.ExecutionMode): Promise<{ successful: Hooks.ExecutionResult[], failed: Hooks.ExecutionResult[] }> {
    let successful: Hooks.ExecutionResult[] = [];
    let failed: Hooks.ExecutionResult[] = [];

    let repeater = async (i: number) => {
      if (typeof(this.hooks[i]) === "undefined") return;

      const hookResult = await this.executeWithResultset(i, executionMode);
      hookResult.success ? successful.push({ hook: this.hooks[i], result: hookResult.result }) : failed.push({ hook: this.hooks[i], result: hookResult.result });

      if (!hookResult.success && stopOnFailure) {
        return;
      } else {
        await repeater(i + 1);
      }
    };

    // Start the loop with first hook -> and continue with all other
    await repeater(0);

    // Return resultset
    return { successful: successful, failed: failed };
  }
}