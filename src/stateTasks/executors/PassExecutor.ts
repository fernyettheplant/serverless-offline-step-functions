import { StateProcessor } from '../../StateProcessor';
import { StateTypeExecutor } from '../StateTypeExecutor';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import type { PassStateDefinition } from '../../types/State';

export class PassExecutor implements StateTypeExecutor {
  public execute(
    _stateMachineName: string,
    stateName: string,
    definition: PassStateDefinition,
    json: string | undefined,
  ): Promise<StateExecutorOutput> {
    console.log(`* * * Passed Task ${stateName} * * *`);
    const input = this.processInput(json, definition);

    return Promise.resolve({
      Next: definition.Next,
      End: definition.End,
      json: this.processOutput(input, definition),
    });
  }

  private processInput(json: string | undefined, stateDefinition: PassStateDefinition): string {
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.InputPath);
    // TODO: Parameters Task

    return proccessedInputJson;
  }

  private processOutput(output: string, stateDefinition: PassStateDefinition): string {
    let outputJson = output || '{}';

    // TODO: Do Result Selector
    outputJson = StateProcessor.processResultPath(outputJson, stateDefinition.ResultPath);
    outputJson = StateProcessor.processOutputPath(outputJson, stateDefinition.OutputPath);

    return outputJson;
  }
}
