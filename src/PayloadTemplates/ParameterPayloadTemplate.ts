import { JSONPath } from 'jsonpath-plus';
import { Context } from '../Context/Context';
import { ContextToJson } from '../Context/ContextToJson';
import { PayloadTemplateType } from '../types/State';
import { Logger } from '../utils/Logger';
import { PayloadTemplate } from './PayloadTemplate';

export class ParameterPayloadTemplate extends PayloadTemplate {
  private static acceptableParameterProperties = ['FunctionName', 'Payload'];
  constructor(private readonly _payload: PayloadTemplateType, private readonly _context: Context) {
    super();
  }

  static create(payload: PayloadTemplateType, context: Context): ParameterPayloadTemplate {
    return new ParameterPayloadTemplate(payload, context);
  }

  private hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }

  protected processPathKey(key: string, path: unknown, inputJson: string): Record<string, unknown> {
    if (typeof path !== 'string') {
      throw new Error(
        `The path for the field '${key}' must be a STRING that contains a JSONPath but was an ${typeof path}`,
      );
    }

    const newKey = key.substring(0, key.length - 2);

    let result: any;

    if (this.isContextObjectPath(path)) {
      const jsonContext = ContextToJson(this._context);

      result = JSONPath({
        path: path.substring(1, path.length),
        json: jsonContext,
      });

      if (result.length < 1) {
        const message = `Could not process key "${key}", with path "${path}" for json ${jsonContext}.`;
        Logger.getInstance().error(message);
        throw new Error(message);
      }

      if (this.hasJsonStructure(result[0])) {
        result[0] = JSON.parse(result[0]);
      }
    } else {
      result = JSONPath({
        path: path === undefined ? '$' : path,
        json: JSON.parse(inputJson),
      });

      if (result.length < 1) {
        const message = `Could not process key "${key}", with path "${path}" for json ${inputJson}.`;
        Logger.getInstance().error(message);
        throw new Error(message);
      }
    }

    return { [newKey]: result[0] };
  }

  process(inputJson: string): Record<string, unknown> {
    return this.processPayloadTemplate(inputJson, this._payload);
  }
}
