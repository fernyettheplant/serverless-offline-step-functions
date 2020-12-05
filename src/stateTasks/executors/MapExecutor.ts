import { StateTypeExecutor } from '../StateTypeExecutor';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import type { MapStateDefinition } from '../../types/State';

import { Context } from '../../Context/Context';
import { ExecuteType, StateMachineExecutor, StateMachineExecutorError } from '../../StateMachineExecutor';
import { StateContext } from '../../Context/StateContext';
import { StateProcessor } from '../../StateProcessor';
import { StateMachineDescription } from '../../types/StateMachineDescription';
import { StateMachine } from '../../StateMachine/StateMachine';

export class MapExecutor extends StateTypeExecutor {
  private pendingStateMachineExecutions: { [key: string]: ExecuteType } = {};

  public async execute(
    context: Context,
    stateDefinition: MapStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    const stateMachineDescription: StateMachineDescription = {
      name: stateDefinition.Comment,
      definition: stateDefinition.Iterator,
    };

    const stateMachine = StateMachine.create(stateMachineDescription.name || '', stateMachineDescription);
    // TODO: Extract common logic from StepFunctionSimulatorServer
    // TODO: Make nested Maps work
    // TODO: Make the waitForTaskToken work in Map & nested maps

    if (!inputJson) {
      throw new Error(`Undefined inputJson for state `);
    }

    const iterable = this.processInput(inputJson, stateDefinition, context);

    if (!Array.isArray(iterable)) {
      this.logger.error(
        `Processed input is not an array with InputPath: ${stateDefinition.InputPath} and input: ${inputJson}`,
      );
      throw new Error('Input is not an array');
    }

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
        const execution = await sme.execute(startAtState, JSON.stringify(value));

        if (execution instanceof StateMachineExecutorError) {
          throw execution.error;
        }

        output.push(execution);
      }),
    );

    return {
      Next: stateDefinition.Next,
      End: stateDefinition.End,
      json: JSON.stringify(output),
    };
  }

  // TODO: Extract to a common place for Map & Task executors
  private processInput(json: string | undefined, stateDefinition: MapStateDefinition, context: Context): unknown {
    this.logger.debug(`MapExecutor - processInput1 - ${json}`);
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.ItemsPath);
    this.logger.debug(`MapExecutor - processInput2 - ${proccessedInputJson}`);

    // TODO: Implement Parameters

    try {
      return JSON.parse(proccessedInputJson);
    } catch (error) {
      this.logger.error(
        `MapExecutor.processInput: Could not parse JSON for state ${context.State.Name}: "${proccessedInputJson}"`,
      );
      throw error;
    }
  }
}
