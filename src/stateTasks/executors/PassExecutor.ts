import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import type { PassStateDefinition } from '../../types/State';
import { StateProcessor } from '../../StateProcessor';
import { StateTypeExecutor } from '../StateTypeExecutor';
import { Logger } from '../../utils/Logger';

export class PassExecutor extends StateTypeExecutor {
  private readonly logger: Logger;

  constructor() {
    super();
    this.logger = Logger.getInstance();
  }

  public execute(
    _stateMachineName: string,
    stateName: string,
    definition: PassStateDefinition,
    json: string | undefined,
  ): Promise<StateExecutorOutput> {
    this.logger.log(`* * * Passed Task ${stateName} * * *`);
    const input = this.processInput(json, definition);

    return Promise.resolve({
      Next: definition.Next,
      End: definition.End,
      json: this.processOutput(input, input, definition),
    });
  }

  private processInput(json: string | undefined, stateDefinition: PassStateDefinition): string {
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.InputPath);
    // TODO: Parameters Task

    return proccessedInputJson;
  }

  private processOutput(input: string, output: string, stateDefinition: PassStateDefinition): string {
    let outputJson = output || '{}';

    // TODO: Do Result Selector
    outputJson = StateProcessor.processResultPath(JSON.parse(input), JSON.parse(output), stateDefinition.ResultPath);
    outputJson = StateProcessor.processOutputPath(outputJson, stateDefinition.OutputPath);

    return outputJson;
  }
}
