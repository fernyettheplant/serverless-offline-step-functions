import { TaskRetryRule } from './State';
import { StatesErrors } from './StatesErrors';

export class Retrier {
  private _currentNumberOfRetries = 0;
  private _currentIntervalSeconds: number;

  private constructor(
    private readonly _ErrorEquals: StatesErrors[],
    private readonly _IntervalSeconds: number = 1,
    private readonly _MaxAttempts: number = 3,
    private readonly _BackoffRate: number = 2.0,
  ) {
    this._currentIntervalSeconds = _IntervalSeconds;
  }

  public static create(taskRetryRule: TaskRetryRule): Retrier {
    return new Retrier(
      taskRetryRule.ErrorEquals,
      taskRetryRule.IntervalSeconds,
      taskRetryRule.MaxAttempts,
      taskRetryRule.BackoffRate,
    );
  }

  public shouldRetry(): boolean {
    return this._currentNumberOfRetries < this._MaxAttempts;
  }
  public retried(): void {
    this._currentNumberOfRetries = this._currentNumberOfRetries + 1;
    this._currentIntervalSeconds = this._currentIntervalSeconds * this._BackoffRate;
  }

  get currentNumberOfRetries(): number {
    return this._currentNumberOfRetries;
  }
  get currentIntervalSeconds(): number {
    return this._currentIntervalSeconds;
  }

  get ErrorEquals(): StatesErrors[] {
    return this._ErrorEquals;
  }
}
