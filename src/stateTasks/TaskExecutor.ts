import { promises as fs, constants as FsConstants } from 'fs';
import path from 'path';
import { StateInfoHandler } from '../StateInfoHandler';
import { StateTypeExecutor } from './StateTypeExecutor';

export class TaskExecutor implements StateTypeExecutor {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async execute(stateMachineName: string, stateName: string, input: any): Promise<any> {
    const statesInfoHandler = StateInfoHandler.getInstance();
    const stateInfo = statesInfoHandler.getStateInfo(stateMachineName, stateName);

    if (!stateInfo) {
      throw new Error('Handler does not exists');
    }

    // TODO: Handle Lambda Context and Callback
    const context = {};
    const lambdaPath = await this.getWebpackOrCommonFuction(stateInfo.handlerPath);
    const functionLambda = await import(`${lambdaPath}`);

    return functionLambda[stateInfo.handlerName](input, context);
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
}
