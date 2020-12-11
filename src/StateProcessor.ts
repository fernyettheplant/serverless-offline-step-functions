import { JSONPath } from 'jsonpath-plus';
import { PayloadTemplateType } from '../src/types/State';
import { Context } from './Context/Context';
import { LambdaWaitFotTokenPayloadTemplate } from './PayloadTemplates/LambdaWaitFotTokenPayloadTemplate';
import { ParameterPayloadTemplate } from './PayloadTemplates/ParameterPayloadTemplate';
import { Logger } from './utils/Logger';

export class StateProcessor {
  protected static logger: Logger = Logger.getInstance();

  public static processItemsPath(dataJson: string | undefined | null, itemsPath: string | null | undefined): string {
    this.logger.debug(`StateProcessor - processItemsPath - ${dataJson}`);
    if (itemsPath === null) {
      return '[]';
    }

    const inputJson = dataJson || '{}';

    const result = JSONPath({
      path: itemsPath === undefined ? '$' : itemsPath,
      json: JSON.parse(inputJson),
    });

    if (!result || result.length === 0) {
      throw new Error(`Could not find itemsPath "${itemsPath}" in JSON "${dataJson}"`);
    }

    return JSON.stringify(result[0]);
  }

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
    payloadTemplateInput: PayloadTemplateType | undefined,
    context: Context,
  ): string {
    this.logger.debug('Starting processParameters');
    this.logger.debug(JSON.stringify(dataJson));
    this.logger.debug(JSON.stringify(payloadTemplateInput));

    if (!payloadTemplateInput) {
      return dataJson || '{}';
    }

    const inputJson = dataJson || '{}';

    const payloadTemplate = ParameterPayloadTemplate.create(payloadTemplateInput, context);

    return JSON.stringify(payloadTemplate.process(inputJson));
  }

  public static processResultPath(
    input: Record<string, unknown>,
    result: Record<string, unknown> | unknown[],
    resultPath?: string,
  ): string {
    this.logger.debug('processResultPath');
    if (!resultPath || resultPath === '$') {
      this.logger.debug('No result path defined');
      return JSON.stringify(result);
    }

    this.logger.debug(resultPath);

    let resultPathArray = (JSONPath as any).toPathArray(resultPath);

    // Not sure why, but sometimes there dollar sign is missing :/
    if (resultPathArray[0] !== '$') {
      resultPathArray = ['$', ...resultPathArray];
    }

    this.logger.debug('resultPathArray');
    this.logger.debug(resultPathArray);
    this.logger.debug('input');
    this.logger.debug(JSON.stringify(input));

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
