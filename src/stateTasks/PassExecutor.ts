import { StateTypeExecutor } from './StateTypeExecutor';

export class PassExecutor implements StateTypeExecutor {
  public execute(): Promise<any> {
    return Promise.resolve();
  }
}
