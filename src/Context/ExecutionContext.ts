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
    const stateMachineArn = stateMachineContext.Id;
    const stateMachineExecutionArn = stateMachineArn.split(':').slice(0, 5);
    stateMachineExecutionArn.push('execution');
    stateMachineExecutionArn.push(stateMachineContext.Name);
    stateMachineExecutionArn.push(executionName);

    return stateMachineExecutionArn.join(':');
  }

  get Id(): string {
    return this._id;
  }

  get Input(): string | undefined {
    return this._input;
  }

  get Name(): string {
    return this._name;
  }

  get RoleArn(): string {
    return this._roleArn;
  }

  get StartTime(): string {
    return this._startTime;
  }
}
