import type { StateDefinition, StateMachine } from './types/StateMachine';
import { JSONPath } from 'jsonpath-plus';
import { TaskExecutor } from './stateTasks/TaskExecutor';
import { StateTypeExecutorFactory } from './stateTasks/StateTypeExecutorFactory';

export class StateMachineExecutor {
  readonly #stateMachine: StateMachine;
  readonly #startDate: number;
  readonly #executionArn: string;
  #currentStateName: string;

  constructor(stateMachine: StateMachine) {
    this.#stateMachine = stateMachine;
    this.#currentStateName = stateMachine.definition.StartAt;
    this.#startDate = Date.now();
    this.#executionArn = `${this.#stateMachine.name}-${this.#stateMachine.definition.StartAt}-${this.#startDate}`;
  }

  public async execute(stateDefinition: StateDefinition, input: string | undefined): Promise<void> {
    console.log(`* * * * * ${this.#currentStateName} * * * * *`);
    console.log('input: \n', JSON.stringify(input, null, 2), '\n');

    // This will be used as the parent node key for when the process
    // finishes and its output needs to be processed.
    // const outputKey = `sf-${Date.now()}`;
    const inputToPass = this.processTaskInputPath(stateDefinition, input);
    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);
    const result = await typeExecutor.execute(inputToPass);

    if (stateDefinition.End) {
      console.log('State Machine Ended');
      return;
    }

    this.#currentStateName = stateDefinition.Next;
    console.log('output: \n', JSON.stringify(result, null, 2), '\n');

    // Call recursivly State Machine Executor until no more states
    this.execute(this.#stateMachine.definition.States[stateDefinition.Next], result);
  }

  get startDate(): number {
    return this.#startDate;
  }

  get executionArn(): string {
    return this.#executionArn;
  }

  /**
   * Process the state's InputPath - per AWS docs:
   * The InputPath field selects a portion of the state's input to pass to the state's
   * task for processing. If you omit the field, it gets the $ value, representing the
   * entire input. If you use null, the input is discarded (not sent to the state's
   * task) and the task receives JSON text representing an empty object {}.
   * https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-input-output-processing.html
   */
  private processTaskInputPath(stateDefinition: StateDefinition, input: any): any {
    return JSONPath({
      path: !stateDefinition.InputPath ? '$' : stateDefinition.InputPath,
      json: input,
    });
  }
}
