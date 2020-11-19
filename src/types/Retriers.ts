import { Context } from '../Context/Context';
import { Logger } from '../utils/Logger';
import { Retrier } from './Retrier';
import { TaskRetryRule } from './State';
import { StatesErrors } from './StatesErrors';

export class Retriers {
  private logger: Logger;

  private constructor(private readonly _retriers: Retrier[]) {
    this.logger = Logger.getInstance();
  }

  public static create(taskRetryRules: TaskRetryRule[]): Retriers {
    const retriers = taskRetryRules.map((taskRetryRule) => {
      return Retrier.create(taskRetryRule);
    });
    return new Retriers(retriers);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getStatesErrorFrom(error: Error): StatesErrors {
    // TODO: Use error to determine if timeout occured
    return StatesErrors.TaskFailed;
  }

  private getRetrierBasedOn(error: Error): Retrier | undefined {
    const errorType: StatesErrors = this.getStatesErrorFrom(error);
    const retrier = this._retriers.find((retrier) => {
      return retrier.ErrorEquals.includes(errorType) || retrier.ErrorEquals.includes(StatesErrors.All);
    });
    if (!retrier) {
      return;
    }
    return retrier;
  }

  // TODO: Add the number of retries to the context object
  async retry(fn: () => any, context: Context): Promise<any> {
    try {
      const output = await fn();
      return output;
    } catch (error) {
      const retrier = this.getRetrierBasedOn(error);

      if (retrier && retrier.shouldRetry()) {
        this.logger.log(
          `Retrying ${context.StateMachine.Name}-${context.State.Name}, retry #${retrier.currentNumberOfRetries + 1}`,
        );

        const interval = retrier.currentIntervalSeconds;

        return await new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              retrier.retried();
              const output = await this.retry(fn, context);
              return resolve(output);
            } catch (error) {
              return reject(error);
            }
          }, interval * 1000);
        });
      } else {
        return fn();
      }
    }
  }
}
