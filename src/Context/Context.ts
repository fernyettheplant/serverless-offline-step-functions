import { ExecutionContext } from './ExecutionContext';
import { StateContext } from './StateContext';
import { StateMachineContext } from './StateMachineContext';
import { TaskContext } from './TaskContext';

export class Context {
  private _taskContext?: TaskContext;

  constructor(
    private readonly _executionContext: ExecutionContext,
    private readonly _stateMachineContext: StateMachineContext,
    private _stateContext: StateContext,
  ) {}

  public static create(
    executionContext: ExecutionContext,
    stateMachineContext: StateMachineContext,
    stateContext: StateContext,
  ): Context {
    return new Context(executionContext, stateMachineContext, stateContext);
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

  get Task(): TaskContext | undefined {
    return this._taskContext;
  }

  transitionToState(state: StateContext, task: TaskContext = TaskContext.create()): void {
    this._stateContext = state;
    this._taskContext = task;
  }
}
