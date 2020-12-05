import type { StateDefinition, TaskStateDefinition } from './types/State';

import { StateTypeExecutorFactory } from './stateTasks/StateTypeExecutorFactory';
import { StateExecutorOutput } from './types/StateExecutorOutput';
import { Logger } from './utils/Logger';
import { Context } from './Context/Context';
import { StateContext } from './Context/StateContext';
import { ContextToJson } from './Context/ContextToJson';
import { StateMachine } from './StateMachine/StateMachine';
import { isJsonByteLengthValid } from './utils/isJsonByteLengthValid';

export type ExecuteType = () => Promise<ExecuteType | string | void | StateMachineExecutorError>;

export class StateMachineExecutorError {
  constructor(public readonly error: Error) {}
}

export class StateMachineExecutor {
  private readonly context: Context;
  private readonly stateMachine: StateMachine;
  private readonly logger: Logger;

  constructor(stateMachine: StateMachine, context: Context) {
    this.context = context;
    this.stateMachine = stateMachine;
    this.logger = Logger.getInstance();
  }

  public async execute(
    stateDefinition: StateDefinition,
    inputJson: string | undefined,
  ): Promise<ExecuteType | string | void | StateMachineExecutorError> {
    this.logger.log(`* * * * * ${this.context.State.Name} * * * * *`);
    this.logger.log(`input: \n${inputJson ? JSON.stringify(JSON.parse(inputJson), null, 2) : 'undefined'}\n`);
    this.logger.log(`context: \n${JSON.stringify(ContextToJson(this.context), null, 2)}\n`);

    const typeExecutor = StateTypeExecutorFactory.getExecutor(stateDefinition.Type);

    // Execute State
    let stateExecutorOutput: StateExecutorOutput;

    try {
      stateExecutorOutput = await typeExecutor.execute(this.context, stateDefinition, inputJson);

      this.logger.debug(`StateMachineExecutor - execute1 - ${stateExecutorOutput}`);

      if (!isJsonByteLengthValid(stateExecutorOutput.json)) {
        this.logger.error(
          `The state/task '${this.context.State.Name}' returned a result with a size exceeding the maximum number of bytes service limit.`,
        );

        throw new Error('Return result must have size less than or equal to 262144 bytes in UTF-8 encoding');
      }

      if (stateExecutorOutput.End) {
        this.logger.log(`[${this.context.State.Name}] State Machine Ended`);
        return stateExecutorOutput.json;
      }

      if (!stateExecutorOutput.Next) {
        this.logger.error(`[${this.context.State.Name}] Should Have ended`);
        throw new Error('Should have ended');
      }

      const nextState = StateContext.create(stateExecutorOutput.Next);

      const executeNextState = () => {
        this.context.transitionTo(nextState);
        return this.execute(this.stateMachine.definition.States[nextState.Name], stateExecutorOutput.json);
      };

      this.logger.log(`Output: \n${JSON.stringify(JSON.parse(stateExecutorOutput.json), null, 2)}\n`);
      if (typeExecutor.isWaitForTaskToken((stateDefinition as TaskStateDefinition).Resource)) {
        this.logger.log(
          `Step function execution paused. \n Waiting for success or failure with task token "${this.context.Task.Token}"\n`,
        );
        return executeNextState.bind(this);
      } else {
        return executeNextState();
      }
    } catch (error) {
      // TODO: Error Handling for State Errors including FailState. Must be done
      this.logger.error(error.stack);
      return new StateMachineExecutorError(error);
    }
  }
}
