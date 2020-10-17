import { Context } from '../Context/Context';
import type { StateDefinition } from '../types/State';
import type { StateExecutorOutput } from '../types/StateExecutorOutput';

export abstract class StateTypeExecutor {
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
