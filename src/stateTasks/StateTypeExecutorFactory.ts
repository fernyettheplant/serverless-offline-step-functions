import { StateTypeExecutor } from './StateTypeExecutor';
import { StateType } from './StateType';
import { TaskExecutor } from './TaskExecutor';
import { PassExecutor } from './PassExecutor';

export class StateTypeExecutorFactory {
  private static STATE_TYPE_MAP = new Map<StateType, StateTypeExecutor>([
    [StateType.Task, new TaskExecutor()],
    [StateType.Pass, new PassExecutor()],
  ]);

  public static getExecutor(type: StateType): StateTypeExecutor {
    const stateTypeExecutor = this.STATE_TYPE_MAP.get(type);

    if (!stateTypeExecutor) {
      throw new Error(`State of Type "${type}" is not supported yet.`);
    }

    return stateTypeExecutor;
  }
}
