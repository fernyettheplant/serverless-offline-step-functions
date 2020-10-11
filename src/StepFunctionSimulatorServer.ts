import type { StepFunctions } from 'aws-sdk';
import { createHttpTerminator, HttpTerminator } from 'http-terminator';
import chalk from 'chalk';
import express, { Express, Request, Response } from 'express';

import type { StateMachines } from './types/StateMachine';
import type { StateDefinition } from './types/State';
import { StateMachineExecutor } from './StateMachineExecutor';

export type StepFunctionSimulatorServerOptions = {
  port: number;
  stateMachines: StateMachines;
};

export class StepFunctionSimulatorServer {
  private express: Express;
  private httpTerminator?: HttpTerminator;
  // TODO: Move State Machines and type it
  private options: StepFunctionSimulatorServerOptions;
  private logPrefix = chalk.magenta('[Step Functions API Simulator]');

  constructor(options: StepFunctionSimulatorServerOptions) {
    this.options = options;
    this.express = express();
    this.setupMiddlewares();
  }

  public async initServer(): Promise<void> {
    let httpServer;

    try {
      httpServer = this.express.listen(this.options.port, () => {
        console.log(`${this.logPrefix} server ready: ${this.options.port} 🚀`);
      });
    } catch (err) {
      console.error(`Unexpected error while starting serverless-offline server on port ${this.options.port}:`, err);
      process.exit(1);
    }

    this.httpTerminator = createHttpTerminator({ server: httpServer });
  }

  public async shutdown(): Promise<void> {
    console.log('Killing Step Functions API Simulator');
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

  private resolveStateMachine(req: Request, res: Response) {
    console.log(`${this.logPrefix} Got request for ${req.method} ${req.url}`);

    const executionInput: StepFunctions.Types.StartExecutionInput = req.body;
    const stateMachineName: string = executionInput.stateMachineArn.split(':').slice(-1)[0];
    const stateMachineToExecute = this.options.stateMachines[stateMachineName];

    if (!stateMachineToExecute) {
      return res.status(500);
    }

    const startAtState: StateDefinition =
      stateMachineToExecute.definition.States[stateMachineToExecute.definition.StartAt];
    const sme = new StateMachineExecutor(stateMachineToExecute);

    // TODO: check integration type to set input properly (i.e. lambda vs. sns)
    sme.execute(startAtState, JSON.stringify(executionInput.input));

    // per docs, step execution response includes the start date and execution arn
    const output: StepFunctions.Types.StartExecutionOutput = {
      startDate: sme.startDate,
      executionArn: sme.executionArn,
    };

    return res.status(200).json(output);
  }
}
