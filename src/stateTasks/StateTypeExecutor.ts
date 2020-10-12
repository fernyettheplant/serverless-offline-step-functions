import type { StateDefinition } from '../types/State';
import type { StateExecutorOutput } from '../types/StateExecutorOutput';

export interface StateTypeExecutor {
  execute(
    stateMachineName: string,
    stateName: string,
    definition: StateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput>;
}
