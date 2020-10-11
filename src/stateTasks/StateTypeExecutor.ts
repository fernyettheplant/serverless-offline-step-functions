import type { StateDefinition } from '../types/State';

export interface StateTypeExecutor {
  execute(
    stateMachineName: string,
    stateName: string,
    definition: StateDefinition,
    inputJson: string | undefined,
  ): Promise<string>;
}
