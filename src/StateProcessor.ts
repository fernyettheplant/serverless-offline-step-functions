import { JSONPath } from 'jsonpath-plus';
import { PayloadTemplateType } from '../src/types/State';
import { Context } from './Context/Context';
import { LambdaWaitFotTokenPayloadTemplate } from './PayloadTemplates/LambdaWaitFotTokenPayloadTemplate';
import { ParameterPayloadTemplate } from './PayloadTemplates/ParameterPayloadTemplate';
import { Logger } from './utils/Logger';

export class StateProcessor {
  protected static logger: Logger = Logger.getInstance();

  public static processInputPath(dataJson: string | undefined | null, inputPath: string | null | undefined): string {
    this.logger.debug(`StateProcessor - processInputPath - ${dataJson}`);
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

  public static processWaitForTokenParameters(
    dataJson: string | undefined | null,
    parameters: PayloadTemplateType,
    context: Context,
  ): string {
    const inputJson = dataJson || '{}';

    /**
     * Get correct PayloadTemplate based on the type of the resource (lambda/sqs/sns/etc.)
     * For now, only lambdas are implemented
     */
    const payloadTemplate = LambdaWaitFotTokenPayloadTemplate.create(parameters, context);

    return JSON.stringify(payloadTemplate.process(inputJson));
  }

  public static processParameters(
    dataJson: string | undefined | null,
    payloadTemplateInput?: PayloadTemplateType,
  ): string {
    if (!payloadTemplateInput) {
      return dataJson || '{}';
    }

    const inputJson = dataJson || '{}';

    const payloadTemplate = ParameterPayloadTemplate.create(payloadTemplateInput);

    return JSON.stringify(payloadTemplate.process(inputJson));
  }

  public static processResultPath(
    input: Record<string, unknown>,
    result: Record<string, unknown>,
    resultPath?: string,
  ): string {
    if (!resultPath || resultPath === '$') {
      return JSON.stringify(result);
    }

    const resultPathArray = (JSONPath as any).toPathArray(resultPath);

    let temp: any = input;
    for (let i = 1; i < resultPathArray.length; i++) {
      const key = resultPathArray[i];
      if (i === resultPathArray.length - 1) {
        temp[key] = result;
      } else {
        if (!temp[key]) {
          temp[key] = {};
        }

        temp = temp[key];
      }
    }

    return JSON.stringify(input);
  }

  public static processOutputPath(json?: string, outputPath?: string): string {
    // TODO: check if AWS throws or skips this
    if (!json) {
      throw new Error('Output JSON of lambda was undefined');
    }

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
