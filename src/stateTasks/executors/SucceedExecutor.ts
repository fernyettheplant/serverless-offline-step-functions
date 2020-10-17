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
    stateMachineName: string,
    stateName: string,
    _definition: SucceedStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    this.logger.log(`StateMachine "${stateMachineName}" succeed on "${stateName}"`);
    return Promise.resolve({
      End: true,
      json: inputJson || '{}',
    });
  }
}
