import type { StateDefinition, StateMachine } from './types/StateMachine';
import { JSONPath } from 'jsonpath-plus';

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
    console.log('input: \n', JSON.stringify(inputJson, null, 2), '\n');
    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);

    // Proccess Input
    const proccessedInputJson = this.processInputPath(inputJson, stateDefinition.InputPath);
    // TODO: Parameters Task

    // Execute State
    const parsedInput = JSON.parse(proccessedInputJson);
    const resultState = await typeExecutor.execute(this.stateMachine.name, this.currentStateName, parsedInput);
    let outputJson = resultState ? JSON.stringify(resultState) : '{}';

    // ProcessOutput
    // TODO: Do Result Selector

    if (stateDefinition.Type !== StateType.Fail) {
      if ([StateType.Parallel, StateType.Task, StateType.Pass].includes(stateDefinition.Type)) {
        outputJson = this.processResultPath(outputJson, stateDefinition.ResultPath);
      }

      outputJson = this.processOutputPath(outputJson, stateDefinition.OutputPath);
    }

    if ([StateType.Succeed, StateType.Fail].includes(stateDefinition.Type) || stateDefinition.End) {
      console.log('State Machine Ended');
      return outputJson;
    }

    // Call recursivly State Machine Executor until no more states
    this.currentStateName = stateDefinition.Next;
    console.log('Output: \n', JSON.stringify(outputJson, null, 2), '\n');
    this.execute(this.stateMachine.definition.States[stateDefinition.Next], outputJson);
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
