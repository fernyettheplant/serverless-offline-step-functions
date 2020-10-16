import { promises as fs, constants as FsConstants } from 'fs';
import path from 'path';

import type { StateTypeExecutor } from '../StateTypeExecutor';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import type { TaskStateDefinition } from '../../types/State';

import { StateInfoHandler } from '../../StateInfoHandler';
import { StateProcessor } from '../../StateProcessor';

export class TaskExecutor implements StateTypeExecutor {
  public async execute(
    stateMachineName: string,
    stateName: string,
    stateDefinition: TaskStateDefinition,
    inputJson: string | undefined,
  ): Promise<StateExecutorOutput> {
    const statesInfoHandler = StateInfoHandler.getInstance();
    const stateInfo = statesInfoHandler.getStateInfo(stateMachineName, stateName);

    if (!stateInfo) {
      throw new Error('Handler does not exists');
    }

    // TODO: Handle Lambda Context and Callback
    const input = this.processInput(inputJson, stateDefinition);
    const context = {};
    const lambdaPath = await this.getWebpackOrCommonFuction(stateInfo.handlerPath);
    const functionLambda = await import(`${lambdaPath}`);

    this.injectEnvVarsLambdaSpecific(stateInfo.environment);
    const output = await functionLambda[stateInfo.handlerName](input, context);
    this.removeEnvVarsLambdaSpecific(stateInfo.environment);

    const outputJson = this.processOutput(output, stateDefinition);

    return {
      Next: stateDefinition.Next,
      End: stateDefinition.End,
      json: outputJson,
    };
  }

  private processInput(json: string | undefined, stateDefinition: TaskStateDefinition): any {
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.InputPath);
    // TODO: Parameters Task

    return JSON.parse(proccessedInputJson);
  }

  private processOutput(output: any, stateDefinition: TaskStateDefinition): string {
    let outputJson = output ? JSON.stringify(output) : '{}';

    // TODO: Do Result Selector
    outputJson = StateProcessor.processResultPath(outputJson, stateDefinition.ResultPath);
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
