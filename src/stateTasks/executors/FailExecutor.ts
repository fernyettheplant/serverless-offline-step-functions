import { Context } from '../../Context/Context';
import type { FailStateDefinition } from '../../types/State';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { FailExecutorException } from '../exceptions/FailExecutorException';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class FailExecutor extends StateTypeExecutor {
  public execute(context: Context, definition: FailStateDefinition): Promise<StateExecutorOutput> {
    this.logger.error(`StateMachine "${context.StateMachine.Name}" Failed on "${context.State.Name}"`);

    return Promise.reject(
      new FailExecutorException(
        `StateMachine "${context.StateMachine.Name}" Failed on "${context.State.Name}"`,
        definition.Cause,
        definition.Error,
      ),
    );
  }
}
