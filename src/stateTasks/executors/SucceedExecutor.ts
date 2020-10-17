import { Context } from '../../Context/Context';
import { SucceedStateDefinition } from '../../types/State';
import { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { Logger } from '../../utils/Logger';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class SucceedExecutor extends StateTypeExecutor {
  private readonly logger: Logger;

  constructor() {
    super();
    this.logger = Logger.getInstance();
  }

  public execute(
    context: Context,
    _definition: SucceedStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    this.logger.error(`StateMachine "${context.StateMachine.Name}" succeed on "${context.State.Name}"`);
    return Promise.resolve({
      End: true,
      json: inputJson || '{}',
    });
  }
}
