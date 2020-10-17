import { JSONPath } from 'jsonpath-plus';
import { PayloadTemplateType } from '../types/State';
import { PayloadTemplate } from './PayloadTemplate';

export class ParameterPayloadTemplate extends PayloadTemplate {
  private static acceptableParameterProperties = ['FunctionName', 'Payload'];
  constructor(private readonly _payload: PayloadTemplateType) {
    super();
  }

  static create(payload: PayloadTemplateType): ParameterPayloadTemplate {
    return new ParameterPayloadTemplate(payload);
  }

  protected processPathKey(key: string, value: unknown, inputJson: string): Record<string, unknown> {
    if (typeof value !== 'string') {
      throw new Error(
        `The value for the field '${key}' must be a STRING that contains a JSONPath but was an ${typeof value}`,
      );
    }

    const newKey = key.substring(0, key.length - 2);

    const result = JSONPath({
      path: value === undefined ? '$' : value,
      json: JSON.parse(inputJson),
    });

    return { [newKey]: result[0] };
  }

  process(inputJson: string): Record<string, unknown> {
    return this.processPayloadTemplate(inputJson, this._payload);
  }
}
