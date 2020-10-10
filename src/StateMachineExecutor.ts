import type { StateDefinition, StateMachine } from './types/StateMachine';
import { JSONPath } from 'jsonpath-plus';

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
    console.log('input: \n', JSON.stringify(inputJson, null, 2), '\n');
    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);

    // Proccess Input
    const proccessedInputJson = this.processInputPath(inputJson, stateDefinition.InputPath);
    // TODO: Parameters Task

    // Execute State
    const parsedInput = JSON.parse(proccessedInputJson);
    const resultState = await typeExecutor.execute(this.stateMachine.name, this.currentStateName, parsedInput);
    const resultStateJson = resultState ? JSON.stringify(resultState) : '{}';

    // ProcessOutput
    // TODO: Do Result Selector
    let proccessedOutputJson = this.processResultPath(resultStateJson, stateDefinition.ResultPath);
    proccessedOutputJson = this.processOutputPath(proccessedOutputJson, stateDefinition.OutputPath);

    console.log('Output: \n', JSON.stringify(proccessedOutputJson, null, 2), '\n');

    if (stateDefinition.End) {
      console.log('State Machine Ended');
      return proccessedOutputJson;
    }

    this.currentStateName = stateDefinition.Next;

    // Call recursivly State Machine Executor until no more states
    this.execute(this.stateMachine.definition.States[stateDefinition.Next], proccessedOutputJson);
  }

  get startDate(): Date {
    return this._startDate;
  }

  get executionArn(): string {
    return this._executionArn;
  }

  private processInputPath(dataJson: string | undefined | null, inputPath: string | null | undefined): string {
    if (inputPath === null) {
      return '{}';
    }

    const inputJson = dataJson || '{}';

    const result = JSONPath({
      path: inputPath === undefined ? '$' : inputPath,
      json: inputJson,
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return result[0];
  }

  private processResultPath(dataJson: string, resultPath?: string): string {
    const result = JSONPath({
      path: resultPath || '$',
      json: dataJson,
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return result[0];
  }

  private processOutputPath(dataJson: string, outputPath?: string): string {
    const result = JSONPath({
      path: outputPath || '$',
      json: dataJson,
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return result[0];
  }
}
