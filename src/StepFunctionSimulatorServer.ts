import { createHttpTerminator, HttpTerminator } from 'http-terminator';
import express, { Express, Request, Response } from 'express';
import type { StepFunctions } from 'aws-sdk';

import type { StateMachines } from './types/StateMachine';
import type { StateDefinition } from './types/State';
import { ExecuteType, StateMachineExecutor } from './StateMachineExecutor';
import { Logger } from './utils/Logger';
import { StateMachineContext } from './Context/StateMachineContext';
import { ExecutionContext } from './Context/ExecutionContext';
import { Context } from './Context/Context';
import { StateContext } from './Context/StateContext';

export type StepFunctionSimulatorServerOptions = {
  port: number;
  stateMachines: StateMachines;
};

export class StepFunctionSimulatorServer {
  private express: Express;
  private httpTerminator?: HttpTerminator;
  // TODO: Move State Machines and type it
  private options: StepFunctionSimulatorServerOptions;
  private readonly logger: Logger;
  private pendingStateMachineExecutions: { [key: string]: ExecuteType } = {};

  constructor(options: StepFunctionSimulatorServerOptions) {
    this.options = options;
    this.logger = Logger.getInstance();
    this.express = express();
    this.setupMiddlewares();
  }

  public async initServer(): Promise<void> {
    let httpServer;

    try {
      httpServer = this.express.listen(this.options.port, () => {
        this.logger.success(`Server ready on port ${this.options.port} 🚀`);
      });
    } catch (err) {
      this.logger.error(
        `Unexpected error while starting serverless-offline server on port ${this.options.port}: ${err.stack}`,
      );
      process.exit(1);
    }

    this.httpTerminator = createHttpTerminator({ server: httpServer });
  }

  public async shutdown(): Promise<void> {
    this.logger.warning('Killing Step Functions API Simulator 🔪');
    await this.httpTerminator?.terminate();
  }

  private setupMiddlewares(): void {
    this.express.use(
      express.json({
        type(req) {
          const contentType = req.headers['content-type'] || '';

          return ['application/x-amz-json-1.0'].includes(contentType);
        },
      }),
    );

    this.express.use(this.resolveStateMachine.bind(this));
  }

  private async resolveStateMachine(req: Request, res: Response) {
    this.logger.log(`Got request for ${req.method} ${req.url}`);

    const executionInput: StepFunctions.Types.StartExecutionInput = req.body;
    const stateMachineContext = StateMachineContext.create(executionInput.stateMachineArn);
    const stateMachineToExecute = this.options.stateMachines[stateMachineContext.Name];

    if (!stateMachineToExecute) {
      return res.status(500);
    }

    const executionContext = ExecutionContext.create(stateMachineContext, executionInput.input);
    const firstStateContext = StateContext.create(stateMachineToExecute.definition.StartAt);
    const context = Context.create(executionContext, stateMachineContext, firstStateContext);

    const startAtState: StateDefinition = stateMachineToExecute.definition.States[firstStateContext.Name];
    const sme = new StateMachineExecutor(stateMachineToExecute, context);

    await new Promise((resolve) => {
      // per docs, step execution response includes the start date and execution arn
      const output: StepFunctions.Types.StartExecutionOutput = {
        startDate: sme.startDate,
        executionArn: sme.executionArn,
      };

      resolve(res.status(200).json(output));
    });

    const executionResult = await sme.execute(startAtState, executionContext.Input);
    if (typeof executionResult === 'function') {
      // Execution is not complete, we need to persist this to be able to resume
      this.pendingStateMachineExecutions[context.Task.Token] = executionResult;
      console.log('WAITTTTTTTTIIIING');
      setTimeout(() => {
        console.log('RESTARTING STEP FUNC.......');
        this.pendingStateMachineExecutions[context.Task.Token]();
      }, 10000);
    } else {
      // Nothing to do, execution is complete
    }
  }
}
