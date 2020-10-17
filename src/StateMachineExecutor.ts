import type { StateMachine } from './types/StateMachine';
import type { StateDefinition, TaskStateDefinition } from './types/State';

import { StateTypeExecutorFactory } from './stateTasks/StateTypeExecutorFactory';
import { StateExecutorOutput } from './types/StateExecutorOutput';
import { Logger } from './utils/Logger';
import { Context } from './Context/Context';
import { StateContext } from './Context/StateContext';

type ExecuteType = (stateDefinition: StateDefinition, inputJson: string | undefined) => void;

export class StateMachineExecutor {
  private readonly context: Context;
  private readonly stateMachine: StateMachine;
  private readonly _startDate: Date;
  private readonly _executionArn: string;
  private readonly logger: Logger;
  private currentStateName: string;

  constructor(stateMachine: StateMachine, context: Context) {
    this.context = context;
    this.stateMachine = stateMachine;
    this.currentStateName = context.State.Name;
    this.logger = Logger.getInstance();
    this._startDate = new Date();
    this._executionArn = `${this.stateMachine.name}-${this.stateMachine.definition.StartAt}-${this._startDate}`;
  }

  // TODO: Include Context in the JSON Input
  public async execute(
    stateDefinition: StateDefinition,
    inputJson: string | undefined,
  ): Promise<ExecuteType | string | void> {
    this.logger.log(`* * * * * ${this.context.State.Name} * * * * *`);
    this.logger.log(`input: \n${inputJson ? JSON.stringify(JSON.parse(inputJson), null, 2) : 'undefined'}\n`);

    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);

    // Execute State
    let stateExecutorOutput: StateExecutorOutput;

    try {
      stateExecutorOutput = await typeExecutor.execute(
        this.stateMachine.name,
        this.context.State.Name,
        stateDefinition,
        inputJson,
      );

      if (stateExecutorOutput.End) {
        this.logger.log(`[${this.context.State.Name}] State Machine Ended`);
        return stateExecutorOutput.json;
      }

      if (!stateExecutorOutput.Next) {
        this.logger.error(`[${this.context.State.Name}] Should Have ended`);
        throw new Error('Should have ended');
      }

      // Call recursivly State Machine Executor until no more states
      // TODO: Transition

      const nextState = StateContext.create(stateExecutorOutput.Next);
      this.context.transitionTo(nextState);

      // this.context.State.Name = stateExecutorOutput.Next;
      this.logger.log(`Output: \n${JSON.stringify(JSON.parse(stateExecutorOutput.json), null, 2)}\n`);
      // if (typeExecutor.isWaitForTaskToken((stateDefinition as TaskStateDefinition).Resource)) {
      //   this.execute.bind(
      //     this,
      //     this.stateMachine.definition.States[stateExecutorOutput.Next],
      //     stateExecutorOutput.json,
      //   );
      // } else {
      this.execute(this.stateMachine.definition.States[nextState.Name], stateExecutorOutput.json);
      // }
    } catch (error) {
      // TODO: Error Handling for State Errors including FailState. Must be done
      this.logger.error(error.stack);
    }
  }

  get startDate(): Date {
    return this._startDate;
  }

  get executionArn(): string {
    return this._executionArn;
  }
}
