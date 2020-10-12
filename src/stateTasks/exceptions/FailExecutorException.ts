import { StringMap } from 'aws-sdk/clients/ecs';

export class FailExecutorException extends Error {
  constructor(message: string, public readonly cause?: string, public readonly error?: string) {
    super(message);
  }
}
