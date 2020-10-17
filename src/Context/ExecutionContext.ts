import { v4 as uuid } from 'uuid';
import { StateMachineContext } from './StateMachineContext';

export class ExecutionContext {
  constructor(
    private readonly _id: string,
    private readonly _input: string | undefined,
    private readonly _name: string,
    private readonly _roleArn: string,
    private readonly _startTime: string,
  ) {}

  public static create(stateMachineContext: StateMachineContext, input: string | undefined): ExecutionContext {
    const executionName = 'randomExecutionName' + uuid();
    const id = this.createStateMachineExecutionArn(stateMachineContext, executionName);
    const roleArn = 'randomExecutionRoleArn' + uuid();

    return new ExecutionContext(id, input, executionName, roleArn, new Date().toISOString());
  }

  private static createStateMachineExecutionArn(
    stateMachineContext: StateMachineContext,
    executionName: string,
  ): string {
    const stateMachineArn = stateMachineContext.id;
    const stateMachineExecutionArn = stateMachineArn.split(':').slice(0, 5);
    stateMachineExecutionArn.push('execution');
    stateMachineExecutionArn.push(stateMachineContext.name);
    stateMachineExecutionArn.push(executionName);

    return stateMachineExecutionArn.join(':');
  }

  get input(): string | undefined {
    return this._input;
  }
}
