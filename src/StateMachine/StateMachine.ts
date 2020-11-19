import { StateMachineDefinition, StateMachineDescription } from '../types/StateMachineDescription';

export class StateMachine {
  private constructor(
    private readonly _stateMachineKey: string,
    private readonly _stateMachineDescription: StateMachineDescription,
  ) {}

  public static create(stateMachineKey: string, stateMachineDescription: StateMachineDescription): StateMachine {
    return new StateMachine(stateMachineKey, stateMachineDescription);
  }

  public get definition(): StateMachineDefinition {
    return this._stateMachineDescription.definition;
  }

  public get name(): string {
    return this._stateMachineDescription.name || this._stateMachineKey;
  }
}
