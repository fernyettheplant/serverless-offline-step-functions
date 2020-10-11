import type { StateMachine } from './types/StateMachine';
import type { StateDefinition } from './types/State';

import { StateTypeExecutorFactory } from './stateTasks/StateTypeExecutorFactory';
import { StateType } from './stateTasks/StateType';

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
    //TODO: Perhaps return what is the next state?
    const outputJson = await typeExecutor.execute(
      this.stateMachine.name,
      this.currentStateName,
      stateDefinition,
      inputJson,
    );

    if ([StateType.Succeed, StateType.Fail].includes(stateDefinition.Type) || stateDefinition.End) {
      console.log('State Machine Ended');
      return outputJson;
    }

    // Call recursivly State Machine Executor until no more states
    this.currentStateName = stateDefinition.Next;
    console.log('Output: \n', JSON.stringify(JSON.parse(outputJson), null, 2), '\n');
    this.execute(this.stateMachine.definition.States[stateDefinition.Next], outputJson);
  }

  get startDate(): Date {
    return this._startDate;
  }

  get executionArn(): string {
    return this._executionArn;
  }
}
