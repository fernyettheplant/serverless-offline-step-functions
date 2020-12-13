import chunk from 'lodash.chunk';

import { StateTypeExecutor } from '../StateTypeExecutor';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import type { MapStateDefinition } from '../../types/State';

import { Context } from '../../Context/Context';
import { ExecuteType, StateMachineExecutor, StateMachineExecutorError } from '../../StateMachineExecutor';
import { StateContext } from '../../Context/StateContext';
import { StateProcessor } from '../../StateProcessor';
import { StateMachineDescription } from '../../types/StateMachineDescription';
import { StateMachine } from '../../StateMachine/StateMachine';
import { Logger } from '../../utils/Logger';

type IterableType = ExecuteType | string | void;
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

    const iterableOutputPromises: Promise<IterableType>[] = iterable.map(
      async (value: unknown, index: number): Promise<IterableType> => {
        const tempContext = context.clone();
        tempContext.startMapItration(index, typeof value === 'string' ? value : JSON.stringify(value));

        const iterationInput = StateProcessor.processParameters(inputJson, stateDefinition.Parameters, tempContext);

        const stateName = stateDefinition.Iterator.StartAt;
        const stateContext = StateContext.create(stateName);
        tempContext.transitionTo(stateContext);

        const sme = new StateMachineExecutor(stateMachine, tempContext);
        const startAtState = stateDefinition.Iterator.States[stateDefinition.Iterator.StartAt];

        // TODO: Add the index so that everything we log can be followed more easily
        const execution = await sme.execute(startAtState, iterationInput);

        if (execution instanceof StateMachineExecutorError) {
          throw execution.error;
        }

        return typeof execution === 'string' ? JSON.parse(execution) : execution;
      },
    );

    const maxConcurrency = stateDefinition.MaxConcurrency || 0;

    let iterableOutput: IterableType[] = [];
    if (maxConcurrency <= 0) {
      this.logger.log('Running Map iterables in Parallel');
      iterableOutput = await Promise.all(iterableOutputPromises);
    } else {
      this.logger.log(`Running Map iterables in chunks of ${maxConcurrency}`);
      const promiseChunks = chunk(iterableOutputPromises, maxConcurrency);

      for (let index = 0; index < promiseChunks.length; index++) {
        const promisechunk = promiseChunks[index];
        this.logger.log(`Running Map iterable chunk (${index + 1}/${promiseChunks.length})`);
        const result = await Promise.all(promisechunk);

        iterableOutput.push(...result);
      }
    }

    this.logger.debug('Finished processing iterable');
    this.logger.debug(JSON.stringify(iterableOutput));

    const output = this.processOutput(JSON.parse(inputJson), iterableOutput, stateDefinition);

    return {
      Next: stateDefinition.Next,
      End: stateDefinition.End,
      json: JSON.stringify(output),
    };
  }

  private processOutput(
    input: Record<string, unknown>,
    output: Record<string, unknown> | unknown[],
    stateDefinition: MapStateDefinition,
  ): unknown {
    this.logger.debug(`MapExecutor - processOutput - stepOutputJSON - input`);
    this.logger.debug(typeof input);
    this.logger.debug(JSON.stringify(input));
    this.logger.debug(`MapExecutor - processOutput - stepOutputJSON - output`);
    this.logger.debug(JSON.stringify(output));
    this.logger.debug(typeof output);

    const stepOutputJSON = StateProcessor.processResultPath(input, output, stateDefinition.ResultPath);
    this.logger.debug(stepOutputJSON);
    const outputJson = StateProcessor.processOutputPath(stepOutputJSON, stateDefinition.OutputPath);
    this.logger.debug(outputJson);

    let processedOutput: unknown;
    try {
      processedOutput = JSON.parse(outputJson);
      this.logger.debug(`processedOutput`);
      this.logger.debug(typeof processedOutput);
    } catch (error) {
      this.logger.error(`MapExecutor.processInput: Could not parse JSON: "${outputJson}"`);
      throw error;
    }

    return processedOutput;
  }

  // TODO: Extract to a common place for Map & Task executors
  private processInput(json: string | undefined, stateDefinition: MapStateDefinition, context: Context): unknown[] {
    this.logger.debug(`MapExecutor - processInput1 - ${json}`);
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.InputPath);
    const proccessedItemsJson = StateProcessor.processItemsPath(proccessedInputJson, stateDefinition.ItemsPath);

    let processedItems: unknown;
    try {
      processedItems = JSON.parse(proccessedItemsJson);
    } catch (error) {
      this.logger.error(
        `MapExecutor.processInput: Could not parse JSON for state ${context.State.Name}: "${proccessedItemsJson}"`,
      );
      throw error;
    }

    if (!Array.isArray(processedItems)) {
      this.logger.error(
        'Processed input & items is not an array ' +
          `with InputPath: ${stateDefinition.InputPath} & ItemsPaths: ${stateDefinition.ItemsPath} and input: ${json}`,
      );
      throw new Error('Input is not an array');
    }

    Logger.getInstance().debug('Finished processing Map input');
    Logger.getInstance().debug(JSON.stringify(processedItems));
    Logger.getInstance().debug(typeof processedItems[0]);

    return processedItems;
  }
}
