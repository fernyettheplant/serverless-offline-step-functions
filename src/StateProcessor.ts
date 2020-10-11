import { JSONPath } from 'jsonpath-plus';

export class StateProcessor {
  public static processInputPath(dataJson: string | undefined | null, inputPath: string | null | undefined): string {
    if (inputPath === null) {
      return '{}';
    }

    const inputJson = dataJson || '{}';

    const result = JSONPath({
      path: inputPath === undefined ? '$' : inputPath,
      json: inputJson,
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return result[0];
  }

  public static processResultPath(dataJson: string, resultPath?: string): string {
    const result = JSONPath({
      path: resultPath || '$',
      json: dataJson,
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return result[0];
  }

  public static processOutputPath(dataJson: string, outputPath?: string): string {
    const result = JSONPath({
      path: outputPath || '$',
      json: dataJson,
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return result[0];
  }
}
