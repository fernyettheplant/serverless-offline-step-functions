import { Context } from '../Context/Context';
import type { StateDefinition } from '../types/State';
import type { StateExecutorOutput } from '../types/StateExecutorOutput';

export abstract class StateTypeExecutor {
  abstract execute(
    context: Context,
    definition: StateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput>;

  public isWaitForTaskToken(resource?: string): boolean {
    return false;
  }
}
