import { JSONPath } from 'jsonpath-plus';
import { Context } from '../Context/Context';
import { ContextToJson } from '../Context/ContextToJson';
import { PayloadTemplateType } from '../types/State';
import { WaitFotTokenPayloadTemplate } from './WaitForTokenPayloadTemplate';

export class LambdaWaitFotTokenPayloadTemplate extends WaitFotTokenPayloadTemplate {
  private static acceptableParameterProperties = ['FunctionName', 'Payload'];
  constructor(private readonly _payload: PayloadTemplateType, private readonly context: Context) {
    super();
  }

  static create(payload: PayloadTemplateType, context: Context): LambdaWaitFotTokenPayloadTemplate {
    // TODO: Move this validation to the abstract class and let children define acceptableParameterProperties
    if (!payload.FunctionName) {
      throw new Error(`The field 'FunctionName' is required but was missing`);
    }

    Object.keys(payload).forEach((key) => {
      if (!this.acceptableParameterProperties.includes(key)) {
        throw new Error(`The field "${key}" is not supported by Step Functions`);
      }
    });

    return new LambdaWaitFotTokenPayloadTemplate(payload, context);
  }

  protected processPathKey(key: string, value: unknown, inputJson: string): Record<string, unknown> {
    if (typeof value !== 'string') {
      throw new Error(
        `The value for the field '${key}' must be a STRING that contains a JSONPath but was an ${typeof value}`,
      );
    }

    // Strip the `.$` at the end
    const newKey = key.substring(0, key.length - 2);

    if (this.isContextObjectPath(value)) {
      const result = JSONPath({
        path: value.substring(1),
        json: ContextToJson(this.context),
      });

      return { [newKey]: result[0] };
    } else {
      const result = JSONPath({
        path: value === undefined ? '$' : value,
        json: JSON.parse(inputJson),
      });

      return { [newKey]: result[0] };
    }
  }

  process(inputJson: string): Record<string, unknown> {
    return this.processPayloadTemplate(inputJson, this._payload.Payload);
  }
}
