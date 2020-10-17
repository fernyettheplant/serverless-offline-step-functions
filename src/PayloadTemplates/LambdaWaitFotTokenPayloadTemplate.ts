import { JSONPath } from 'jsonpath-plus';
import { PayloadTemplate } from '../types/State';
import { WaitFotTokenPayloadTemplate } from './WaitForTokenPayloadTemplate';

export class LambdaWaitFotTokenPayloadTemplate extends WaitFotTokenPayloadTemplate {
  private static acceptableParameterProperties = ['FunctionName', 'Payload'];
  constructor(private readonly _payload: PayloadTemplate) {
    super();
  }

  static create(payload: PayloadTemplate): LambdaWaitFotTokenPayloadTemplate {
    if (!payload.FunctionName) {
      throw new Error(`The field 'FunctionName' is required but was missing`);
    }

    Object.keys(payload).forEach((key) => {
      if (!this.acceptableParameterProperties.includes(key)) {
        throw new Error(
          `The field "${key}" is not supported by Step Functions`,
        );
      }
    });

    return new LambdaWaitFotTokenPayloadTemplate(payload);
  }

  private processPathKey(key, value, inputJson) {
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

  private processPayloadTemplateEntry(
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
          inputJson,
          value as Record<string, unknown>,
        ),
      };
    }

    return { [key]: value };
  }

  private processPayloadTemplate(
    inputJson: string,
    payload?: Record<string, unknown>,
  ): any {
    if (!payload) {
      return {};
    }

    let output = {};
    Object.entries(payload).forEach(([key, value]: [string, unknown]) => {
      output = {
        ...output,
        ...this.processPayloadTemplateEntry(key, value, inputJson),
      };
    });
    return output;
  }

  process(inputJson: string): Record<string, unknown> {
    return this.processPayloadTemplate(inputJson, this._payload.Payload);
  }
}
