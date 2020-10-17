import { promises as fs, constants as FsConstants } from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { StateTypeExecutor } from '../StateTypeExecutor';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import type { TaskStateDefinition } from '../../types/State';

import { StateInfoHandler } from '../../StateInfoHandler';
import { StateProcessor } from '../../StateProcessor';
import { Context } from '../../Context/Context';

export class TaskExecutor extends StateTypeExecutor {
  public async execute(
    context: Context,
    stateDefinition: TaskStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    const statesInfoHandler = StateInfoHandler.getInstance();
    const stateInfo = statesInfoHandler.getStateInfo(context.StateMachine.Name, context.State.Name);

    if (!stateInfo) {
      throw new Error('Handler does not exists');
    }

    // TODO: Handle Lambda Context and Callback
    const input = this.processInput(inputJson, stateDefinition, context);
    const lambdaPath = await this.getWebpackOrCommonFuction(stateInfo.handlerPath);
    const functionLambda = await import(`${lambdaPath}`);

    this.injectEnvVarsLambdaSpecific(stateInfo.environment);
    const output = await functionLambda[stateInfo.handlerName](input, context);
    this.removeEnvVarsLambdaSpecific(stateInfo.environment);

    const outputJson = this.processOutput(input, output, stateDefinition);

    return {
      Next: stateDefinition.Next,
      End: stateDefinition.End,
      json: outputJson,
    };
  }

  public isWaitForTaskToken(resource?: string): boolean {
    if (resource && resource.endsWith('.waitForTaskToken')) {
      return true;
    }
    return false;
  }

  private processInput(json: string | undefined, stateDefinition: TaskStateDefinition, context: Context): any {
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.InputPath);

    let output = proccessedInputJson;

    if (stateDefinition.Parameters && stateDefinition.Resource.endsWith('.waitForTaskToken')) {
      output = StateProcessor.processWaitForTokenParameters(proccessedInputJson, stateDefinition.Parameters, context);
    } else {
      output = StateProcessor.processParameters(proccessedInputJson, stateDefinition.Parameters);
    }

    return JSON.parse(output);
  }

  private processOutput(
    input: Record<string, unknown>,
    output: Record<string, unknown>,
    stateDefinition: TaskStateDefinition,
  ): string {
    let outputJson = output ? JSON.stringify(output) : '{}';

    // TODO: Do Result Selector
    outputJson = StateProcessor.processResultPath(input, output, stateDefinition.ResultPath);
    outputJson = StateProcessor.processOutputPath(outputJson, stateDefinition.OutputPath);

    return outputJson;
  }

  private async getWebpackOrCommonFuction(lambdaFilePath: string): Promise<string> {
    const webpackPath = path.resolve(process.cwd(), `./.webpack/service/${lambdaFilePath}.js`);
    let filePathResolved: string;

    try {
      await fs.access(webpackPath, FsConstants.F_OK | FsConstants.R_OK);
      filePathResolved = webpackPath;
    } catch (error) {
      filePathResolved = `./${lambdaFilePath}`;
    }

    return filePathResolved;
  }

  private injectEnvVarsLambdaSpecific(lambdaEnv: Record<string, string> | undefined): void {
    if (!lambdaEnv) {
      return;
    }

    Object.entries(lambdaEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  private removeEnvVarsLambdaSpecific(lambdaEnv: Record<string, string> | undefined): void {
    if (!lambdaEnv) {
      return;
    }

    Object.keys(lambdaEnv).forEach((key) => {
      delete process.env[key];
    });
  }
}
