import { Retrier } from './Retrier';
import { TaskRetryRule } from './State';
import { StatesErrors } from './StatesErrors';

export class Retriers {
  private constructor(private readonly _retriers: Retrier[]) {}

  public static create(taskRetryRules: TaskRetryRule[]): Retriers {
    const retriers = taskRetryRules.map((taskRetryRule) => {
      return Retrier.create(taskRetryRule);
    });
    return new Retriers(retriers);
  }

  private getRetrierBasedOn(statesError: StatesErrors): Retrier | undefined {
    const retrier = this._retriers.find((retrier) => {
      return retrier.ErrorEquals.includes(statesError);
    });
    if (!retrier) {
      return;
    }
    return retrier;
  }

  // TODO: Add the number of retries to the context object
  async retry(fn: () => any): Promise<any> {
    // TODO: Add timeout error catching
    const retrier = this.getRetrierBasedOn(StatesErrors.TaskFailed);

    if (retrier) {
      return await retrier.retry(fn);
    } else {
      return fn();
    }
  }
}
