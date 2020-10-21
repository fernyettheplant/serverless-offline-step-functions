import { StateTypeExecutor } from '../StateTypeExecutor';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import type { MapStateDefinition } from '../../types/State';

import { Context } from '../../Context/Context';
import { ExecuteType, StateMachineExecutor } from '../../StateMachineExecutor';
import { StateMachine } from '../../types/StateMachine';
import { StateContext } from '../../Context/StateContext';

export class MapExecutor extends StateTypeExecutor {
  private pendingStateMachineExecutions: { [key: string]: ExecuteType } = {};

  public async execute(
    context: Context,
    stateDefinition: MapStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    const stateMachine: StateMachine = {
      name: stateDefinition.Comment || '',
      definition: stateDefinition.Iterator,
    };
    // TODO: Extract common logic from StepFunctionSimulatorServer
    // TODO: Make nested Maps work
    // TODO: Make the waitForTaskToken work in Map & nested maps

    if (!inputJson) {
      throw new Error(`Undefined inputJson for state `);
    }

    const iterable = JSON.parse(inputJson);
    type MyType = ExecuteType | string | void;
    const output: MyType[] = [];
    await Promise.all(
      iterable.map(async (value: unknown) => {
        const tempContext = context.clone();
        const stateName = stateDefinition.Iterator.StartAt;
        const stateContext = StateContext.create(stateName);
        tempContext.transitionTo(stateContext);

        const sme = new StateMachineExecutor(stateMachine, tempContext);
        const startAtState = stateDefinition.Iterator.States[stateDefinition.Iterator.StartAt];

        // TODO: Add the index so that everything we log can be followed more easily
        output.push(await sme.execute(startAtState, JSON.stringify(value)));
      }),
    );

    return {
      Next: stateDefinition.Next,
      End: stateDefinition.End,
      json: JSON.stringify(output),
    };
  }
}
