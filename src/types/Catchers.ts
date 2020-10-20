import { Catcher } from './Catcher';
import { TaskCatchRule } from './State';
import { StatesErrors } from './StatesErrors';

export class Catchers {
  private constructor(private readonly _catchers: Catcher[]) {}

  public static create(taskCatchRules: TaskCatchRule[]): Catchers {
    const catchers = taskCatchRules.map((taskCatchRule) => {
      return Catcher.create(taskCatchRule);
    });
    return new Catchers(catchers);
  }

  public getCatcherBasedOn(statesErrors: StatesErrors[]): Catcher | undefined {
    const catcher = this._catchers.find((catcher) => {
      return catcher.includesSomeOf(statesErrors);
    });
    if (!catcher) {
      return;
    }
    return catcher;
  }
}
