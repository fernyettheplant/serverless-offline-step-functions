import type { ServerlessOfflineStepFunctionsOptions } from './types/ServerlessOfflineStepFunctionsOptions';
import type {
  CLIOptions,
  ServerlessOfflineStepFunctionsCommands,
} from './types/ServerlessOfflineStepFunctionsCommands';
import type { ServerlessOfflineHooks } from './types/ServerlessOfflineHooks';
import { StepFunctionSimulatorServer } from './StepFunctionSimulatorServer';
import { StateInfoHandler } from './StateInfoHandler';
import { Logger } from './utils/Logger';
import { MapStateDefinition, StateDefinition, TaskStateDefinition } from './types/State';
import { StateType } from './stateTasks/StateType';
import { EnvVarResolver } from './utils/EnvVarResolver';
import { StateMachines } from './StateMachine/StateMachines';
import { StateMachinesDescription } from './types/StateMachineDescription';

class ServerlessOfflineStepFunctionsPlugin {
  public hooks?: ServerlessOfflineHooks;
  public commands: ServerlessOfflineStepFunctionsCommands;

  private serverless: Record<any, any>;
  private cliOptions: CLIOptions;
  private options?: ServerlessOfflineStepFunctionsOptions;
  private stepFunctionSimulatorServer?: StepFunctionSimulatorServer;
  private logger: Logger;

  constructor(serverless: Record<any, any>, cliOptions: CLIOptions) {
    this.serverless = serverless;
    this.cliOptions = cliOptions;
    this.logger = Logger.getInstance();

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
          debug: {
            required: false,
            usage: 'Enable Debugger Output (Default: false)',
          },
        },
      },
    };

    this.mergeOptions();

    if (this.options?.enabled === false) {
      // Simulator Will not be executed
      this.logger.warning('Simulator will not execute.');
      return;
    }

    if (this.options?.debug === true) {
      this.logger.turnOnDebugger();
    }

    this.hooks = {
      'before:offline:start:init': this.start.bind(this),
      'offline:start:init': this.ready.bind(this),
      'offline:start:end': this.end.bind(this),
    };
  }

  private start() {
    const envVarResolver = EnvVarResolver.getInstance();
    envVarResolver.global = this.serverless.service.initialServerlessConfig?.provider?.environment;
    envVarResolver.injectGlobalEnvVars();

    // Get Handler and Path of the Local Functions
    const definedStateMachines: StateMachinesDescription = this.serverless.service.initialServerlessConfig
      ?.stepFunctions?.stateMachines;

    const stateMachines = StateMachines.create(definedStateMachines);

    if (!stateMachines) {
      throw new Error('No step machines defined');
    }
    this.resolveHandlers(stateMachines);

    this.stepFunctionSimulatorServer = new StepFunctionSimulatorServer({
      port: this.options?.port || 8014,
      stateMachines,
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

  private getFunctionName(stateOptions: StateDefinition): string {
    let functionName: string | undefined;
    const resource: string | Record<string, string[]> = (stateOptions as any).Resource;

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

          if (functionName.endsWith('LambdaFunction')) {
            functionName = functionName.slice(0, -'LambdaFunction'.length);
          }
        }
      }
    }

    if (!functionName) {
      throw Error(`Could not find funciton name for resource ${resource}`);
    }

    return functionName;
  }

  private setStateInfo(states: [string, StateDefinition][], stateMachineName: string) {
    const definedFunctions = this.serverless.service.initialServerlessConfig.functions;
    const statesInfoHandler = StateInfoHandler.getInstance();
    this.logger.debug(`ServerlessOfflineStepFunctionsPlugin - setStateInfo - ${states}`);

    for (const [stateName, stateOptions] of states) {
      // TODO: Instead of checking the types here, we should create objects that have meaning
      if (stateOptions.Type === StateType.Map) {
        const stateDefinition: [string, StateDefinition][] = Object.entries(
          (stateOptions as MapStateDefinition).Iterator.States,
        );
        this.setStateInfo(stateDefinition, stateMachineName);
        continue;
      }

      if (stateOptions.Type !== StateType.Task) {
        continue;
      }

      const functionName = this.getFunctionName(stateOptions as StateDefinition);

      const { handler } = definedFunctions[functionName];
      const indexOfHandlerNameSeparator = handler.lastIndexOf('.');
      const handlerPath = handler.substring(0, indexOfHandlerNameSeparator);
      const handlerName = handler.substring(indexOfHandlerNameSeparator + 1);
      const environment: Record<string, string> | undefined = this.serverless.service.initialServerlessConfig
        ?.functions[functionName]?.environment;

      statesInfoHandler.setStateInfo(stateMachineName, stateName, handlerPath, handlerName, environment);
    }
  }

  private resolveHandlers(definedStateMachines: StateMachines) {
    // Per StateMachine
    for (const stateMachine of definedStateMachines.stateMachines) {
      const states: [string, StateDefinition][] = Object.entries(stateMachine.definition.States);

      this.setStateInfo(states, stateMachine.name);
    }
  }
}

export = ServerlessOfflineStepFunctionsPlugin;
