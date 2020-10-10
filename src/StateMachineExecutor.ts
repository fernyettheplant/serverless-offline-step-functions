import type { StateDefinition, StateMachine } from './types/StateMachine';
import { JSONPath } from 'jsonpath-plus';

import { StateTypeExecutorFactory } from './stateTasks/StateTypeExecutorFactory';

export class StateMachineExecutor {
  readonly #stateMachine: StateMachine;
  readonly #startDate: Date;
  readonly #executionArn: string;
  #currentStateName: string;

  constructor(stateMachine: StateMachine) {
    this.#stateMachine = stateMachine;
    this.#currentStateName = stateMachine.definition.StartAt;
    this.#startDate = new Date();
    this.#executionArn = `${this.#stateMachine.name}-${this.#stateMachine.definition.StartAt}-${this.#startDate}`;
  }

  public async execute(stateDefinition: StateDefinition, inputJson: string | undefined): Promise<string | void> {
    console.log(`* * * * * ${this.#currentStateName} * * * * *`);
    console.log('input: \n', JSON.stringify(inputJson, null, 2), '\n');
    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);

    // Proccess Input
    const proccessedInputJson = this.processInputPath(inputJson, stateDefinition.InputPath);
    // TODO: Parameters Task

    // Execute State
    const parsedInput = JSON.parse(proccessedInputJson);
    const resultState = await typeExecutor.execute(this.#stateMachine.name, this.#currentStateName, parsedInput);
    const resultStateJson = JSON.stringify(resultState);

    // ProcessOutput
    // TODO: Do Result Selector
    // const resultTask = this.processPath(result, stateDefinition.ResultPath);
    // const outputTask = this.processPath(resultTask, stateDefinition.OutputPath);
    console.log('Output: \n', JSON.stringify(resultState, null, 2), '\n');

    if (stateDefinition.End) {
      console.log('State Machine Ended');
      return resultStateJson;
    }

    this.#currentStateName = stateDefinition.Next;

    // Call recursivly State Machine Executor until no more states
    this.execute(this.#stateMachine.definition.States[stateDefinition.Next], resultStateJson);
  }

  get startDate(): Date {
    return this.#startDate;
  }

  get executionArn(): string {
    return this.#executionArn;
  }

  private processInputPath(dataJson: string | undefined, inputPath: string | null | undefined) {
    if (inputPath === null) {
      return '{}';
    }

    const inputJson = dataJson || '{}';

    const result = JSONPath({
      path: !inputPath ? '$' : inputPath,
      json: inputJson,
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return result[0];
  }

  /**
   * Process the state's InputPath, OutputPath
   */
  private processPath(input: any, path?: string): any {
    return JSONPath({
      path: !path ? '$' : path,
      json: input,
    });
  }
}
