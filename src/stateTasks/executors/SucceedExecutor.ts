import { SucceedStateDefinition } from '../../types/State';
import { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class SucceedExecutor implements StateTypeExecutor {
  public execute(
    stateMachineName: string,
    stateName: string,
    _definition: SucceedStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    console.log(`StateMachine "${stateMachineName}" succeed on "${stateName}"`);
    return Promise.resolve({
      End: true,
      json: inputJson || '{}',
    });
  }
}
