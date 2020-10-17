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

  public static processWaitForTokenParameters(
    dataJson: string | undefined | null,
    parameters: PayloadTemplate,
  ): string {
    const inputJson = dataJson || '{}';

    // Get correct PayloadTemplate based on the type of the resource (lambda/sqs/sns/etc.)
    const payloadTemplate = LambdaWaitFotTokenPayloadTemplate.create(
      parameters,
    );

    return JSON.stringify(payloadTemplate.process(inputJson));
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
