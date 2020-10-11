import { StateTypeExecutor } from '../StateTypeExecutor';

export class PassExecutor implements StateTypeExecutor {
  public execute(): Promise<string> {
    return Promise.resolve('{}');
  }
}
