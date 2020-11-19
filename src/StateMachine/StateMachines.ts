import { StateMachinesDescription } from '../types/StateMachineDescription';
import { StateMachine } from './StateMachine';

export class StateMachines {
  private constructor(private readonly _stateMachines: StateMachine[]) {}

  public static create(stateMachines: StateMachinesDescription): StateMachines {
    const stateMachineTupleArray = Object.entries(stateMachines);
    const stateMachineArray = stateMachineTupleArray.map(([key, val]) => StateMachine.create(key, val));

    return new StateMachines(stateMachineArray);
  }

  public getStateMachineBy(name: string): StateMachine {
    return this._stateMachines.filter((val) => val.name === name)[0];
  }

  public get stateMachines(): StateMachine[] {
    return this._stateMachines;
  }
}
