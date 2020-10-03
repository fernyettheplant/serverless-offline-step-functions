export class StateMachineExecutor {
  readonly #stateMachineName;
  readonly #startDate;
  readonly #executionArn;

  #currentStateName;
  #stateMachineJSON;

  constructor(stateMachineName, stateName, stateMachineJSONInput) {
    this.#currentStateName = stateName;
    this.#stateMachineName = stateMachineName;
    this.#stateMachineJSON = {};
    this.#startDate = Date.now();
    this.#executionArn = `${stateMachineName}-${stateName}-${this.#startDate}`;
  }

  public spawnProcess() {}

  get startDate(): Date {
    return this.#startDate;
  }

  get executionArn(): string {
    return this.#executionArn;
  }
}
