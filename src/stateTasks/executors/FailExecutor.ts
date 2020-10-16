import type { FailStateDefinition } from '../../types/State';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { Logger } from '../../utils/Logger';
import { FailExecutorException } from '../exceptions/FailExecutorException';
import { StateTypeExecutor } from '../StateTypeExecutor';

export class FailExecutor implements StateTypeExecutor {
  private readonly logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  public execute(
    stateMachineName: string,
    stateName: string,
    definition: FailStateDefinition,
  ): Promise<StateExecutorOutput> {
    this.logger.error(`StateMachine "${stateMachineName}" Failed on "${stateName}"`);

    return Promise.reject(
      new FailExecutorException(
        `StateMachine "${stateMachineName}" Failed on "${stateName}"`,
        definition.Cause,
        definition.Error,
      ),
    );
  }
}
