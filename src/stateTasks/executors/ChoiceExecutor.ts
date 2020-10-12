import { JSONPath } from 'jsonpath-plus';

import { StateProcessor } from '../../StateProcessor';
import { StateTypeExecutor } from '../StateTypeExecutor';

import type { ChoiceStateDefinition } from '../../types/State';
import type { ChoiceRule } from '../../types/State';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';

export class ChoiceExector implements StateTypeExecutor {
  public async execute(
    stateMachineName: string,
    stateName: string,
    definition: ChoiceStateDefinition,
    json: string | undefined,
  ): Promise<StateExecutorOutput> {
    const input = this.processInput(json, definition);

    for (const choice of definition.Choices) {
      // TODO: Handler AND, OR and NOT

      const comparators = Object.keys(choice).filter((key) => key !== 'Variable' && key !== 'Next');

      if (comparators.length > 1) {
        throw Error();
      }

      const evaluationPassed = this.evaluateChoice(comparators[0], choice, input);
      if (evaluationPassed) {
        //TODO: Set NEXT
        break;
      }
    }

    // TODO: Maybe return the NextStep in here and the other executors?
    return {
      json: this.processOutput(input, definition),
      Next: 'end',
      End: false,
    };
  }

  private processInput(json: string | undefined, stateDefinition: ChoiceStateDefinition): string {
    const proccessedInputJson = StateProcessor.processInputPath(json, stateDefinition.InputPath);

    return proccessedInputJson;
  }

  private processOutput(outputJson: string, stateDefinition: ChoiceStateDefinition): string {
    const proccessedOutputJson = StateProcessor.processOutputPath(outputJson, stateDefinition.OutputPath);

    return proccessedOutputJson;
  }

  private evaluateChoice(comparator: string, choice: ChoiceRule, json: string): boolean {
    if (!choice.Variable) {
      throw new Error('no "Variable" attribute found in Choice rule');
    }

    const pathResult = JSONPath({
      path: choice.Variable,
      json: JSON.parse(json),
    });

    if (!pathResult || pathResult.length === 0) {
      throw new Error('');
    }

    let inputValue: string | number = pathResult[0];
    let choiceValue: string | number = choice[comparator];

    // This conversion is just to have a precise way to measure dates
    if (comparator.includes('Timestamp')) {
      inputValue = new Date(inputValue).getTime();
      choiceValue = new Date(choiceValue).getTime();
    }

    // TODO: Find a better way to map the comparators with the methods without using factories or strategy
    switch (comparator) {
      case 'BooleanEquals':
      case 'NumericEquals':
      case 'StringEquals':
      case 'TimestampEquals':
        return this.checkEquals(choiceValue, inputValue);
      case 'NumericGreaterThan':
      case 'StringGreaterThan':
      case 'TimestampGreaterThan':
        return this.checkGreaterThan(choiceValue, inputValue);
      case 'NumericGreaterThanEquals':
      case 'StringGreaterThanEquals':
      case 'TimestampGreaterThanEquals':
        return this.checkGreaterThanEquals(choiceValue, inputValue);
      case 'NumericLessThan':
      case 'StringLessThan':
      case 'TimestampLessThan':
        return this.checkLowerThan(choiceValue, inputValue);
      case 'NumericLessThanEquals':
      case 'StringLessThanEquals':
      case 'TimestampLessThanEquals':
        return this.checkLowerThanEquals(choiceValue, inputValue);
      default:
        throw new Error();
    }
  }

  private checkEquals(inputValue: string | number, choiceValue: string | number): boolean {
    return inputValue === choiceValue;
  }

  private checkGreaterThan(inputValue: string | number, choiceValue: string | number): boolean {
    return inputValue > choiceValue;
  }

  private checkGreaterThanEquals(inputValue: string | number, choiceValue: string | number): boolean {
    return inputValue >= choiceValue;
  }

  private checkLowerThan(inputValue: string | number, choiceValue: string | number): boolean {
    return inputValue < choiceValue;
  }

  private checkLowerThanEquals(inputValue: string | number, choiceValue: string | number): boolean {
    return inputValue <= choiceValue;
  }
}
