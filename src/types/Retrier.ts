import { TaskRetryRule } from './State';

export enum StatesErrors {
  DataLimitExceeded = 'States.DataLimitExceeded',
  Runtime = 'States.Runtime',
  Timeout = 'States.Timeout',
  TaskFailed = 'States.TaskFailed',
  Permissions = 'States.Permissions',
}

export class Retrier {
  private currentNumberOfRetries = 0;
  private currentIntervalSeconds: number;

  private constructor(
    private readonly _ErrorEquals: StatesErrors[],
    private readonly _IntervalSeconds: number = 1,
    private readonly _MaxAttempts: number = 3,
    private readonly _BackoffRate: number = 2.0,
  ) {
    this.currentIntervalSeconds = _IntervalSeconds;
  }

  public static create(taskRetryRule: TaskRetryRule): Retrier {
    return new Retrier(
      taskRetryRule.ErrorEquals,
      taskRetryRule.IntervalSeconds,
      taskRetryRule.MaxAttempts,
      taskRetryRule.BackoffRate,
    );
  }

  async retry(fn: () => any): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (this.currentNumberOfRetries < this._MaxAttempts) {
        this.currentNumberOfRetries++;
        return await new Promise((resolve) => {
          setTimeout(async () => {
            this.currentIntervalSeconds = this.currentIntervalSeconds * this._BackoffRate;
            return resolve(await this.retry(fn));
          }, this.currentIntervalSeconds * 1000);
        });
      } else {
        throw error;
      }
    }
  }

  get ErrorEquals(): StatesErrors[] {
    return this._ErrorEquals;
  }
}
