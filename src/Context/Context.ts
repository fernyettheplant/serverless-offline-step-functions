import { ExecutionContext } from './ExecutionContext';
import { StateContext } from './StateContext';
import { StateMachineContext } from './StateMachineContext';
import { TaskContext } from './TaskContext';

export class Context {
  constructor(
    private readonly _executionContext: ExecutionContext,
    private readonly _stateMachineContext: StateMachineContext,
    private _stateContext: StateContext,
    private _taskContext: TaskContext,
  ) {}

  public static create(
    executionContext: ExecutionContext,
    stateMachineContext: StateMachineContext,
    stateContext: StateContext,
    taskContext: TaskContext = TaskContext.create(),
  ): Context {
    return new Context(executionContext, stateMachineContext, stateContext, taskContext);
  }

  get Execution(): ExecutionContext {
    return this._executionContext;
  }

  get StateMachine(): StateMachineContext {
    return this._stateMachineContext;
  }

  get State(): StateContext {
    return this._stateContext;
  }

  get Task(): TaskContext {
    return this._taskContext;
  }

  transitionTo(state: StateContext, task: TaskContext = TaskContext.create()): void {
    this._stateContext = state;
    this._taskContext = task;
  }
}
