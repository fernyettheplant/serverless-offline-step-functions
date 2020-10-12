import type { StateMachine } from './types/StateMachine';
import type { StateDefinition } from './types/State';

import { StateTypeExecutorFactory } from './stateTasks/StateTypeExecutorFactory';

export class StateMachineExecutor {
  private readonly stateMachine: StateMachine;
  private readonly _startDate: Date;
  private readonly _executionArn: string;
  private currentStateName: string;

  constructor(stateMachine: StateMachine) {
    this.stateMachine = stateMachine;
    this.currentStateName = stateMachine.definition.StartAt;
    this._startDate = new Date();
    this._executionArn = `${this.stateMachine.name}-${this.stateMachine.definition.StartAt}-${this._startDate}`;
  }

  // TODO: Include Context in the JSON Input
  public async execute(stateDefinition: StateDefinition, inputJson: string | undefined): Promise<string | void> {
    console.log(`* * * * * ${this.currentStateName} * * * * *`);
    console.log('input: \n', inputJson ? JSON.stringify(JSON.parse(inputJson), null, 2) : 'undefined', '\n');
    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);

    // Execute State
    const stateExecutorOutput = await typeExecutor.execute(
      this.stateMachine.name,
      this.currentStateName,
      stateDefinition,
      inputJson,
    );

    if (stateExecutorOutput.End) {
      console.log('State Machine Ended');
      return stateExecutorOutput.json;
    }

    if (!stateExecutorOutput.Next) {
      throw new Error('Should have ended');
    }

    // Call recursivly State Machine Executor until no more states
    this.currentStateName = stateExecutorOutput.Next;
    console.log('Output: \n', JSON.stringify(JSON.parse(stateExecutorOutput.json), null, 2), '\n');
    this.execute(this.stateMachine.definition.States[stateExecutorOutput.Next], stateExecutorOutput.json);
  }

  get startDate(): Date {
    return this._startDate;
  }

  get executionArn(): string {
    return this._executionArn;
  }
}
