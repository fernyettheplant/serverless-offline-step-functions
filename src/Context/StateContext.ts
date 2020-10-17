export class StateContext {
  constructor(
    private readonly _enteredTime: string,
    private readonly _name: string,
    private readonly _retryCount: number,
  ) {}

  public static create(name: string, retryCount = 0): StateContext {
    return new StateContext(new Date().toISOString(), name, retryCount);
  }

  get Name(): string {
    return this._name;
  }
}
