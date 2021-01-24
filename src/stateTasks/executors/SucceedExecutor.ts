import { Context } from '../../Context/Context';
import { SucceedStateDefinition } from '../../types/State';
import { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class SucceedExecutor extends StateTypeExecutor {
  public execute(
    context: Context,
    _definition: SucceedStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    this.logger.success(`StateMachine "${context.StateMachine.Name}" succeed on "${context.State.Name}"`);
    return Promise.resolve({
      End: true,
      json: inputJson || '{}',
    });
  }
}
