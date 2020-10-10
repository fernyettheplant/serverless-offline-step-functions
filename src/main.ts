import { Worker } from 'worker_threads';
import type { ServerlessOfflineStepFunctionsOptions } from './types/ServerlessOfflineStepFunctionsOptions';
import type {
  CLIOptions,
  ServerlessOfflineStepFunctionsCommands,
} from './types/ServerlessOfflineStepFunctionsCommands';
import type { ServerlessOfflineHooks } from './types/ServerlessOfflineHooks';
import { StepFunctionSimulatorServer } from './StepFunctionSimulatorServer';

class ServerlessOfflineStepFunctionsPlugin {
  public hooks: ServerlessOfflineHooks;
  public commands: ServerlessOfflineStepFunctionsCommands;

  #serverless: any;
  #cliOptions: CLIOptions;

  #options?: ServerlessOfflineStepFunctionsOptions;
  #stepFunctionSimulatorServer?: StepFunctionSimulatorServer;

  constructor(serverless: any, cliOptions: CLIOptions) {
    this.#serverless = serverless;
    this.#cliOptions = cliOptions;

    this.commands = {
      '@fernthedev/serverless-offline-step-functions': {
        options: {
          port: {
            required: false,
            usage: 'Port of the Step Functions API Simulator',
          },
        },
      },
    };

    this.hooks = {
      'before:offline:start:init': this.start.bind(this),
      'offline:start:init': this.ready.bind(this),
      'offline:start:end': this.end.bind(this),
    };
  }

  private start() {
    this.mergeOptions();

    this.#stepFunctionSimulatorServer = new StepFunctionSimulatorServer({
      port: this.#options?.port || 8014,
      stateMachines: this.#serverless.service.initialServerlessConfig?.stepFunctions?.stateMachines,
    });
  }

  private ready() {
    return this.#stepFunctionSimulatorServer?.initServer();
  }

  private async end() {
    await this.#stepFunctionSimulatorServer?.shutdown();
  }

  private mergeOptions() {
    const custom = this.#serverless.service.custom;
    const customOptions = custom['@fernthedev/serverless-offline-step-functions'];

    // order of Precedence: command line options, custom options, defaults.
    this.#options = {
      ...this.#cliOptions,
      ...customOptions,
    };
  }
}

export = ServerlessOfflineStepFunctionsPlugin;
