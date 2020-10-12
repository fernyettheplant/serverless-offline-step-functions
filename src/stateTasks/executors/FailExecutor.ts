import type { FailStateDefinition } from '../../types/State';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { FailExecutorException } from '../exceptions/FailExecutorException';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class FailExecutor implements StateTypeExecutor {
  public execute(
    stateMachineName: string,
    stateName: string,
    definition: FailStateDefinition,
    _inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    console.log(`* * * Failed On Purpose * * *`);

    throw new FailExecutorException(
      `StateMachine "${stateMachineName}" Failed on "${stateName}"`,
      definition.Cause,
      definition.Error,
    );
  }
}
