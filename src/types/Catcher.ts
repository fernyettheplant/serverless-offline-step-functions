import { TaskCatchRule } from './State';
import { StatesErrors } from './StatesErrors';

export class Catcher {
  private constructor(
    private readonly _ErrorEquals: StatesErrors[],
    private readonly _Next: string,
    private readonly _ResultPath?: string,
  ) {}

  public static create(taskCatchRule: TaskCatchRule): Catcher {
    return new Catcher(taskCatchRule.ErrorEquals, taskCatchRule.Next, taskCatchRule.ResultPath);
  }

  get Next(): string {
    return this._Next;
  }

  get ErrorEquals(): StatesErrors[] {
    return this._ErrorEquals;
  }

  get ResultPath(): string | undefined {
    return this._ResultPath;
  }

  public includesSomeOf(statesErrors: StatesErrors[]): boolean {
    return statesErrors.some((statesError) => this.ErrorEquals.includes(statesError));
  }
}
