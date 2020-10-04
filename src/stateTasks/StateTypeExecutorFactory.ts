import { String } from 'aws-sdk/clients/acm';
import { StateTypeExecutor } from './StateTypeExecutor';
import { StateTypes } from './StateTypes';
import { TaskExecutor } from './TaskExecutor';

export class StateTypeExecutorFactory {
  private static STATE_TYPE_MAP = new Map<StateTypes, StateTypeExecutor>([[StateTypes.Task, new TaskExecutor()]]);

  public static getExecutor(type: string): StateTypeExecutor {
    const stateTypeExecutor = this.STATE_TYPE_MAP.get(StateTypes[type]);

    if (!stateTypeExecutor) {
      throw new Error(`State of Type "${type}" is not supported yet.`);
    }

    return stateTypeExecutor;
  }
}
