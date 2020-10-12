import type { StateMachine } from './types/StateMachine';
import type { StateDefinition } from './types/State';

import { StateTypeExecutorFactory } from './stateTasks/StateTypeExecutorFactory';
import { StateExecutorOutput } from './types/StateExecutorOutput';
import { Logger } from './utils/Logger';

export class StateMachineExecutor {
  private readonly stateMachine: StateMachine;
  private readonly _startDate: Date;
  private readonly _executionArn: string;
  private readonly logger: Logger;
  private currentStateName: string;

  constructor(stateMachine: StateMachine) {
    this.stateMachine = stateMachine;
    this.currentStateName = stateMachine.definition.StartAt;
    this.logger = Logger.getInstance();
    this._startDate = new Date();
    this._executionArn = `${this.stateMachine.name}-${this.stateMachine.definition.StartAt}-${this._startDate}`;
  }

  // TODO: Include Context in the JSON Input
  public async execute(stateDefinition: StateDefinition, inputJson: string | undefined): Promise<string | void> {
    this.logger.log(`* * * * * ${this.currentStateName} * * * * *`);
    this.logger.log(`input: \n${inputJson ? JSON.stringify(JSON.parse(inputJson), null, 2) : 'undefined'}\n`);
    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);

    // Execute State
    let stateExecutorOutput: StateExecutorOutput;

    try {
      stateExecutorOutput = await typeExecutor.execute(
        this.stateMachine.name,
        this.currentStateName,
        stateDefinition,
        inputJson,
      );

      if (stateExecutorOutput.End) {
        this.logger.log(`[${this.currentStateName}] State Machine Ended`);
        return stateExecutorOutput.json;
      }

      if (!stateExecutorOutput.Next) {
        this.logger.error('[${this.currentStateName}] Should Have ended');
        throw new Error('Should have ended');
      }

      // Call recursivly State Machine Executor until no more states
      this.currentStateName = stateExecutorOutput.Next;
      this.logger.log(`Output: \n${JSON.stringify(JSON.parse(stateExecutorOutput.json), null, 2)}\n`);
      this.execute(this.stateMachine.definition.States[stateExecutorOutput.Next], stateExecutorOutput.json);
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
