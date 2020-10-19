import type { ServerlessOfflineStepFunctionsOptions } from './types/ServerlessOfflineStepFunctionsOptions';
import type {
  CLIOptions,
  ServerlessOfflineStepFunctionsCommands,
} from './types/ServerlessOfflineStepFunctionsCommands';
import type { ServerlessOfflineHooks } from './types/ServerlessOfflineHooks';
import { StepFunctionSimulatorServer } from './StepFunctionSimulatorServer';
import { StateInfoHandler } from './StateInfoHandler';
import { Logger } from './utils/Logger';
import { TaskStateDefinition } from './types/State';

class ServerlessOfflineStepFunctionsPlugin {
  public hooks?: ServerlessOfflineHooks;
  public commands: ServerlessOfflineStepFunctionsCommands;

  private serverless: Record<any, any>;
  private cliOptions: CLIOptions;
  private options?: ServerlessOfflineStepFunctionsOptions;
  private stepFunctionSimulatorServer?: StepFunctionSimulatorServer;

  constructor(serverless: Record<any, any>, cliOptions: CLIOptions) {
    this.serverless = serverless;
    this.cliOptions = cliOptions;

    this.commands = {
      '@fernthedev/serverless-offline-step-functions': {
        options: {
          port: {
            required: false,
            usage: 'Port of the Step Functions API Simulator (Default: 8014)',
          },
          enabled: {
            required: false,
            usage: 'Enabled Step Function API Simulator (Default: true)',
          },
        },
      },
    };

    this.mergeOptions();

    if (this.options?.enabled === false) {
      // Simulator Will not be executed
      Logger.getInstance().warning('Simulator will not execute.');
      return;
    }

    this.hooks = {
      'before:offline:start:init': this.start.bind(this),
      'offline:start:init': this.ready.bind(this),
      'offline:start:end': this.end.bind(this),
    };
  }

  private start() {
    this.injectGlobalEnvVars();
    // Get Handler and Path of the Local Functions
    const definedStateMachines = this.serverless.service.initialServerlessConfig?.stepFunctions?.stateMachines;

    this.resolveHandlers(definedStateMachines);

    this.stepFunctionSimulatorServer = new StepFunctionSimulatorServer({
      port: this.options?.port || 8014,
      stateMachines: definedStateMachines,
    });
  }

  private ready() {
    return this.stepFunctionSimulatorServer?.initServer();
  }

  private async end() {
    await this.stepFunctionSimulatorServer?.shutdown();
  }

  private mergeOptions() {
    const custom = this.serverless.service.custom;
    const customOptions = custom['@fernthedev/serverless-offline-step-functions'];

    // order of Precedence: command line options, custom options, defaults.
    this.options = {
      ...this.cliOptions,
      ...customOptions,
    };
  }

  private resolveHandlers(definedStateMachines: any) {
    const definedFunctions = this.serverless.service.initialServerlessConfig.functions;
    const statesInfoHandler = StateInfoHandler.getInstance();
    const definedStateMachinesArr = Object.entries(definedStateMachines);

    // Per StateMachine
    for (const [stateMachineName, stateMachineOptions] of definedStateMachinesArr) {
      const states = Object.entries((stateMachineOptions as any).definition.States);

      // Per State in the StateMachine
      for (const [stateName, stateOptions] of states) {
        if (!(stateOptions as any)?.Resource) {
          // The State Machine in here could be a Pass, Failed or Wait
          break;
        }

        let functionName: string | undefined;
        const resource: string | Record<string, string[]> = (stateOptions as any).Resource;

        // TODO: To extract this to a function/class
        if (typeof resource === 'string') {
          if (resource.endsWith('.waitForTaskToken')) {
            functionName = (stateOptions as TaskStateDefinition).Parameters?.FunctionName?.['Fn::GetAtt'][0];
          } else {
            functionName = resource.split('-').slice(-1)[0];
          }
        } else {
          // probably an object
          for (const [key, value] of Object.entries(resource)) {
            if (key === 'Fn::GetAtt') {
              functionName = value[0];
            }
          }
        }

        if (!functionName) {
          throw Error(`Could not find funciton name for resource ${resource}`);
        }

        const { handler } = definedFunctions[functionName];
        const indexOfHandlerNameSeparator = handler.lastIndexOf('.');
        const handlerPath = handler.substring(0, indexOfHandlerNameSeparator);
        const handlerName = handler.substring(indexOfHandlerNameSeparator + 1);
        const environment: Record<string, string> | undefined = this.serverless.service.initialServerlessConfig
          ?.functions[functionName]?.environment;

        statesInfoHandler.setStateInfo(stateMachineName, stateName, handlerPath, handlerName, environment);
      }
    }
  }

  private injectGlobalEnvVars() {
    const providerEnvironment: Record<string, string> | undefined = this.serverless.service.initialServerlessConfig
      ?.provider?.environment;

    if (providerEnvironment) {
      Object.entries(providerEnvironment).forEach(([key, value]) => {
        process.env[key] = value;
      });
    }
  }
}

export = ServerlessOfflineStepFunctionsPlugin;
