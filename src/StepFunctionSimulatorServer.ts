import { createHttpTerminator, HttpTerminator } from 'http-terminator';
import express, { Express, Request, Response } from 'express';
import type { StepFunctions } from 'aws-sdk';

import type { StateMachines } from './types/StateMachine';
import type { StateDefinition } from './types/State';
import { StateMachineExecutor } from './StateMachineExecutor';
import { Logger } from './utils/Logger';

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
        this.logger.success(`Server ready: ${this.options.port} 🚀`);
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
    const stateMachineName: string = executionInput.stateMachineArn.split(':').slice(-1)[0];
    const stateMachineToExecute = this.options.stateMachines[stateMachineName];

    if (!stateMachineToExecute) {
      return res.status(500);
    }

    const startAtState: StateDefinition =
      stateMachineToExecute.definition.States[stateMachineToExecute.definition.StartAt];
    const sme = new StateMachineExecutor(stateMachineToExecute);

    await new Promise((resolve) => {
      // per docs, step execution response includes the start date and execution arn
      const output: StepFunctions.Types.StartExecutionOutput = {
        startDate: sme.startDate,
        executionArn: sme.executionArn,
      };

      resolve(res.status(200).json(output));
    });

    await sme.execute(startAtState, JSON.stringify(executionInput.input));
  }
}
