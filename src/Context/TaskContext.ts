import { v4 as uuid } from 'uuid';

export class TaskContext {
  constructor(private readonly _taskToken: string) {}

  public static create(): TaskContext {
    return new TaskContext(uuid());
  }
}
