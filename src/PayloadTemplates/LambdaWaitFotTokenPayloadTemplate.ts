import { PayloadTemplate } from '../types/State';
import {
  WaitFotTokenPayloadTemplate,
  WaitFotTokenPayloadTemplateInterface,
} from './WaitForTokenPayloadTemplate';

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
}
