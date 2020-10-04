import { promises as fs, constants as FsConstants } from 'fs';
import path from 'path';
import { StateTypeExecutor } from './StateTypeExecutor';

export class TaskExecutor implements StateTypeExecutor {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async execute(input: any): Promise<any> {
    const context = {};
    const handlerPath = './src/csvGetFile/handler';
    const handlerName = 'getFile';
    const lambdaPath = await this.getWebpackOrCommonFuction(handlerPath);
    const functionLambda = await import(`${lambdaPath}`);

    return functionLambda[handlerName](input, context);
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
