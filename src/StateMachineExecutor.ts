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

  public async execute(stateDefinition: StateDefinition, input: string | undefined): Promise<string | void> {
    console.log(`* * * * * ${this.#currentStateName} * * * * *`);
    console.log('input: \n', JSON.stringify(input, null, 2), '\n');

    // This will be used as the parent node key for when the process
    // finishes and its output needs to be processed.
    // const outputKey = `sf-${Date.now()}`;
    const inputToPass = this.processPath(input, stateDefinition.InputPath);
    // TODO: Parameters Task
    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);
    const result = await typeExecutor.execute(this.#stateMachine.name, this.#currentStateName, inputToPass);

    // TODO: Do Result Selector

    // const resultTask = this.processPath(result, stateDefinition.ResultPath);
    // const outputTask = this.processPath(resultTask, stateDefinition.OutputPath);
    console.log('Output: \n', JSON.stringify(result, null, 2), '\n');

    if (stateDefinition.End) {
      console.log('State Machine Ended');
      // TODO: Verify if last Task will serialize to JSON
      return JSON.stringify(result);
    }

    this.#currentStateName = stateDefinition.Next;

    // Call recursivly State Machine Executor until no more states
    this.execute(this.#stateMachine.definition.States[stateDefinition.Next], result);
  }

  get startDate(): Date {
    return this.#startDate;
  }

  get executionArn(): string {
    return this.#executionArn;
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
