import { Context } from '../Context/Context';
import { Logger } from '../utils/Logger';
import { TaskRetryRule } from './State';
import { StatesErrors } from './StatesErrors';

export class Retrier {
  private currentNumberOfRetries = 0;
  private currentIntervalSeconds: number;
  private logger: Logger;

  private constructor(
    private readonly _ErrorEquals: StatesErrors[],
    private readonly _IntervalSeconds: number = 1,
    private readonly _MaxAttempts: number = 3,
    private readonly _BackoffRate: number = 2.0,
  ) {
    this.currentIntervalSeconds = _IntervalSeconds;
    this.logger = Logger.getInstance();
  }

  public static create(taskRetryRule: TaskRetryRule): Retrier {
    return new Retrier(
      taskRetryRule.ErrorEquals,
      taskRetryRule.IntervalSeconds,
      taskRetryRule.MaxAttempts,
      taskRetryRule.BackoffRate,
    );
  }

  async retry(fn: () => any, context: Context): Promise<any> {
    let output: unknown;
    try {
      output = await fn();
      return output;
    } catch (error) {
      this.logger.error(
        `Caught an error in Retrier for ${context.StateMachine.Name}-${context.State.Name}: ${error.stack}`,
      );
      if (this.currentNumberOfRetries < this._MaxAttempts) {
        this.currentNumberOfRetries++;
        this.logger.log(
          `Retrying ${context.StateMachine.Name}-${context.State.Name}, attempt #${this.currentNumberOfRetries}`,
        );
        return await new Promise((resolve, reject) => {
          setTimeout(async () => {
            this.currentIntervalSeconds = this.currentIntervalSeconds * this._BackoffRate;
            try {
              const output = await this.retry(fn, context);
              return resolve(output);
            } catch (error) {
              return reject(error);
            }
          }, this.currentIntervalSeconds * 1000);
        });
      } else {
        this.logger.log(
          `Already retried MaxAttemps of ${this.currentNumberOfRetries} for ${context.StateMachine.Name}-${context.State.Name}`,
        );
        throw error;
      }
    }
  }

  get ErrorEquals(): StatesErrors[] {
    return this._ErrorEquals;
  }
}
