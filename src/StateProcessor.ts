import { JSONPath } from 'jsonpath-plus';

export class StateProcessor {
  public static processInputPath(dataJson: string | undefined | null, inputPath: string | null | undefined): string {
    if (inputPath === null) {
      return '{}';
    }

    const inputJson = dataJson || '{}';

    const result = JSONPath({
      path: inputPath === undefined ? '$' : inputPath,
      json: JSON.parse(inputJson),
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return JSON.stringify(result[0]);
  }

  private static validateWaitForTokenParameters(parameters: Record<string, unknown>) {
    const acceptableParameterProperties = ['FunctionName', 'Payload'];

    if (!parameters.FunctionName) {
      throw new Error(`The field 'FunctionName' is required but was missing`);
    }

    Object.keys(parameters).forEach((key) => {
      if (!acceptableParameterProperties.includes(key)) {
        throw new Error(`The field "${key}" is not supported by Step Functions`);
      }
    });
  }

  private static isContextObjectPath(path: string) {
    return path.startsWith('$$.');
  }

  private static isPathKey(path: any) {
    return typeof path === 'string' && path.endsWith('.$');
  }

  public static processWaitForTokenParameters(dataJson: string | undefined | null, parameters: any): string {
    const inputJson = dataJson || '{}';

    this.validateWaitForTokenParameters(parameters);

    const output = {};

    // TODO: To extract to a recursive function so that every method can use it
    Object.entries(parameters.Payload).forEach(([key, value]: [string, any]) => {
      if (this.isPathKey(key)) {
        if (typeof value !== 'string') {
          throw new Error(
            `The value for the field '${key}' must be a STRING that contains a JSONPath but was an ${typeof value}`,
          );
        }

        const newKey = key.substring(0, key.length - 2);

        if (this.isContextObjectPath(value)) {
          output[newKey] = value.substring(3);
        } else {
          const result = JSONPath({
            path: value === undefined ? '$' : value,
            json: JSON.parse(inputJson),
          });

          output[newKey] = result[0];
        }
      } else {
        // TODO: Traverse object deeply
        output[key] = value;
      }
    });

    return JSON.stringify(output);
  }

  public static processResultPath(json: string, resultPath?: string): string {
    const result = JSONPath({
      path: resultPath || '$',
      json: JSON.parse(json),
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return JSON.stringify(result[0]);
  }

  public static processOutputPath(json: string, outputPath?: string): string {
    const result = JSONPath({
      path: outputPath || '$',
      json: JSON.parse(json),
    });

    if (!result || result.length === 0) {
      throw new Error('');
    }

    return JSON.stringify(result[0]);
  }
}
