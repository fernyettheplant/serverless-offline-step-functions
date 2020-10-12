import type { ChoiceStateDefinition } from '../../types/State';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class PassExecutor implements StateTypeExecutor {
  public execute(
    stateMachineName: string,
    stateName: string,
    definition: ChoiceStateDefinition,
    json: string | undefined,
  ): Promise<StateExecutorOutput> {
    return Promise.resolve({
      Next: definition.Next,
      End: definition.End,
      json: json || '{}',
    });
  }
}
