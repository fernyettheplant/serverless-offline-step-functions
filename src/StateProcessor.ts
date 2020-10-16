import { JSONPath } from 'jsonpath-plus';
import { PayloadTemplate } from '../src/types/State';
import { LambdaWaitFotTokenPayloadTemplate } from './PayloadTemplates/LambdaWaitFotTokenPayloadTemplate';
import { WaitFotTokenPayloadTemplate } from './PayloadTemplates/WaitForTokenPayloadTemplate';

export class StateProcessor {
  public static processInputPath(
    dataJson: string | undefined | null,
    inputPath: string | null | undefined,
  ): string {
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

  private static isContextObjectPath(path: string) {
    return path.startsWith('$$.');
  }

  private static isPathKey(path: string) {
    return path.endsWith('.$');
  }

  private static processPathKey(key, value, inputJson) {
    if (typeof value !== 'string') {
      throw new Error(
        `The value for the field '${key}' must be a STRING that contains a JSONPath but was an ${typeof value}`,
      );
    }

    const newKey = key.substring(0, key.length - 2);

    if (this.isContextObjectPath(value)) {
      return { [newKey]: value.substring(3) };
    } else {
      const result = JSONPath({
        path: value === undefined ? '$' : value,
        json: JSON.parse(inputJson),
      });

      return { [newKey]: result[0] };
    }
  }

  private static processPayloadTemplateEntry(
    key: string,
    value: unknown,
    inputJson: string,
  ): Record<string, unknown> {
    if (this.isPathKey(key)) {
      return this.processPathKey(key, value, inputJson);
    }

    if (typeof value === 'object' && value !== null) {
      return {
        [key]: this.processPayloadTemplate(
          value as Record<string, unknown>,
          inputJson,
        ),
      };
    }

    return { [key]: value };
  }

  private static processPayloadTemplate(
    payloadTemplate: PayloadTemplate,
    inputJson,
  ): any {
    let output = {};
    Object.entries(payloadTemplate).forEach(
      ([key, value]: [string, unknown]) => {
        output = {
          ...output,
          ...this.processPayloadTemplateEntry(key, value, inputJson),
        };
      },
    );
    return output;
  }

  private static getWaitForTokenPayloadTemplate(
    parameters,
  ): WaitFotTokenPayloadTemplate {
    return LambdaWaitFotTokenPayloadTemplate.create(parameters);
  }

  public static processWaitForTokenParameters(
    dataJson: string | undefined | null,
    parameters: PayloadTemplate,
  ): string {
    const inputJson = dataJson || '{}';

    const somthing: WaitFotTokenPayloadTemplate = this.getWaitForTokenPayloadTemplate(
      parameters,
    );

    if (typeof parameters.Payload !== 'object') {
      return '{}';
    }

    const output = this.processPayloadTemplate(parameters.Payload, inputJson);

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
