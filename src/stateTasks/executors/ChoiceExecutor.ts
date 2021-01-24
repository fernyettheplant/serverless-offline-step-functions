import { JSONPath } from 'jsonpath-plus';

import { StateProcessor } from '../../StateProcessor';
import { StateTypeExecutor } from '../StateTypeExecutor';

import type { ChoiceStateDefinition } from '../../types/State';
import type { ChoiceRule } from '../../types/State';
import type { StateExecutorOutput } from '../../types/StateExecutorOutput';
import { Context } from '../../Context/Context';

export class ChoiceExecutor extends StateTypeExecutor {
  public async execute(
    context: Context,
    definition: ChoiceStateDefinition,
    json: string | undefined,
  ): Promise<StateExecutorOutput> {
    const input = this.processInput(json, definition);
    this.logger.debug('* * * Choice Input * * *');
    this.logger.debug(input);
    let nextState: string | undefined = undefined;

    for (const choice of definition.Choices) {
      let evaluationPassed = false;

      if (choice.Not) {
        const comparator = this.getComparatorFromChoice(choice.Not);
        evaluationPassed = !this.evaluateChoice(comparator, choice.Not, input);
      } else if (choice.And && choice.And.length > 0) {
        evaluationPassed = choice.And.every((choiceAnd) => {
          const comparator = this.getComparatorFromChoice(choiceAnd);
          return this.evaluateChoice(comparator, choiceAnd, input);
        });
      } else if (choice.Or && choice.Or.length > 0) {
        evaluationPassed = choice.Or.some((choiceAnd) => {
          const comparator = this.getComparatorFromChoice(choiceAnd);
          return this.evaluateChoice(comparator, choiceAnd, input);
        });
      } else {
        // Normal ChoiceRule
        const comparator = this.getComparatorFromChoice(choice);
        evaluationPassed = this.evaluateChoice(comparator, choice, input);
      }

      this.logger.debug(`* * * Evaluation Passed?: ${evaluationPassed}`);
      if (evaluationPassed) {
        nextState = choice.Next;
        this.logger.debug(`* * * Next state is : ${nextState}`);
        break; // We got already our branch. time to short circuit
      }
    }

    if (!nextState && definition.Default) {
      nextState = definition.Default;
    } else if (!nextState && !definition.Default) {
      throw new Error('No NextState or Default');
    }

    return {
      json: this.processOutput(input, definition),
      Next: nextState,
      End: false, // Not Supportted on Choice
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

    this.logger.debug('* * * Choice Variable * * *');
    this.logger.debug(choice.Variable);

    const pathResult = JSONPath({
      path: choice.Variable,
      json: JSON.parse(json),
    });

    if (!pathResult || pathResult.length === 0) {
      throw new Error('');
    }

    let inputValue: string | number = pathResult[0];
    this.logger.debug(`Input Value Choice: ${inputValue}`);
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

  private getComparatorFromChoice(choice: ChoiceRule): string {
    const comparators = Object.keys(choice).filter((key) => key !== 'Variable' && key !== 'Next');

    if (comparators.length > 1 || !comparators[0]) {
      throw Error();
    }

    return comparators[0];
  }
}
