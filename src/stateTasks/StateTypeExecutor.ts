export interface StateTypeExecutor {
  execute(stateMachineName: string, stateName: string, input: any): Promise<any>;
}
