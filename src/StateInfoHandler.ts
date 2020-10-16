import type { StateInfo } from './types/State';

export class StateInfoHandler {
  private static INSTANCE: StateInfoHandler;
  private statesHandlersMap: Map<string, StateInfo>;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    this.statesHandlersMap = new Map<string, StateInfo>();
  }

  public static getInstance(): StateInfoHandler {
    if (!this.INSTANCE) {
      this.INSTANCE = new StateInfoHandler();
    }

    return this.INSTANCE;
  }

  public setStateInfo(
    stateMachineName: string,
    stateName: string,
    handlerPath: string,
    handlerName: string,
    environment: Record<string, string> | undefined,
  ): void {
    this.statesHandlersMap.set(`${stateMachineName}+${stateName}`, {
      handlerName,
      handlerPath,
      environment,
    });
  }

  public getStateInfo(stateMachineName: string, stateName: string): StateInfo | undefined {
    return this.statesHandlersMap.get(`${stateMachineName}+${stateName}`);
  }
}
