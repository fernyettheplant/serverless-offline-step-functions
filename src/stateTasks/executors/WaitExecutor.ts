import delay from 'delay';
import { JSONPath } from 'jsonpath-plus';
import { StateProcessor } from '../../StateProcessor';

import type { WaitStateDefinition } from '../../types/State';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { validateTimestamp } from '../../utils/validateTimestamp';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class WaitExecutor implements StateTypeExecutor {
  public async execute(
    _stateMachineName: string,
    _stateName: string,
    definition: WaitStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    const input = this.processInput(inputJson, definition);
    let secondstoPrint: number | undefined;
    let datetoPrint: string | undefined;
    let millisecondsToWait: number | undefined;

    // TODO: Refactor. this is an ugly way to check which a Wait Parameter is defined.
    if (definition.Seconds) {
      secondstoPrint = definition.Seconds;
      millisecondsToWait = this.convertSecondsToMillis(definition.Seconds);
    } else if (definition.Timestamp) {
      validateTimestamp(definition.Timestamp);
      datetoPrint = definition.Timestamp;
      millisecondsToWait = this.convertTimestamptoMillis(definition.Timestamp);
    } else if (definition.SecondsPath) {
      const seconds = this.getSecondsFromPath(input, definition.SecondsPath);
      secondstoPrint = seconds;
      millisecondsToWait = this.convertSecondsToMillis(seconds);
    } else if (definition.TimestampPath) {
      const timestamp = this.getTimestampFromPath(input, definition.TimestampPath);
      validateTimestamp(timestamp);
      datetoPrint = timestamp;
      millisecondsToWait = this.convertTimestamptoMillis(timestamp);
    }

    if (!millisecondsToWait || isNaN(millisecondsToWait)) {
      throw new Error('');
    }

    // Log for Visibility Sake
    if (datetoPrint) {
      console.log(`* * Will Wait Until ${datetoPrint} * *`);
    } else if (secondstoPrint) {
      console.log(`* * Will Wait ${secondstoPrint} Seconds * *`);
    }

    // Wait
    await delay(millisecondsToWait);

    return {
      Next: definition.Next,
      End: definition.End,
      json: this.processOutput(input, definition),
    };
  }

  private processInput(json: string | undefined, stateDefinition: WaitStateDefinition): string {
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.InputPath);

    return proccessedInputJson;
  }

  private processOutput(outputJson: string, stateDefinition: WaitStateDefinition): string {
    const proccessedOutputJson = StateProcessor.processOutputPath(outputJson, stateDefinition.OutputPath);

    return proccessedOutputJson;
  }

  private convertSecondsToMillis(seconds: number): number {
    return seconds * 1000;
  }

  private convertTimestamptoMillis(timestamp: string): number {
    return new Date(timestamp).getTime() - Date.now();
  }

  private getSecondsFromPath(json: string, secondsPath: string): number {
    const result = JSONPath({
      path: secondsPath,
      json: JSON.parse(json),
    });

    if (!result || result.length === 0) {
      throw new Error();
    }

    return result[0];
  }

  private getTimestampFromPath(json: string, timestampPath: string): string {
    const result = JSONPath({
      path: timestampPath,
      json: JSON.parse(json),
    });

    if (!result || result.length === 0) {
      throw new Error();
    }

    return result[0];
  }
}
