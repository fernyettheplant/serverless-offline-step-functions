export class StateMachineContext {
  constructor(private readonly _id: string, private readonly _name: string) {}

  public static create(id: string): StateMachineContext {
    const name = id.split(':').slice(-1)[0];
    return new StateMachineContext(id, name);
  }

  get name(): string {
    return this._name;
  }

  get id(): string {
    return this._id;
  }
}
