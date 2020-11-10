import { Context } from '../Context/Context';
import type { StateDefinition } from '../types/State';
import type { StateExecutorOutput } from '../types/StateExecutorOutput';
import { EnvVarResolver } from '../utils/EnvVarResolver';
import { Logger } from '../utils/Logger';

export abstract class StateTypeExecutor {
  protected logger: Logger;
  protected envVarResolver: EnvVarResolver;

  constructor() {
    this.logger = Logger.getInstance();
    this.envVarResolver = EnvVarResolver.getInstance();
  }

  abstract execute(
    context: Context,
    definition: StateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public isWaitForTaskToken(resource?: string): boolean {
    return false;
  }
}
