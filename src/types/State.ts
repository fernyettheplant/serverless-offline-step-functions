import { StateType } from '../stateTasks/StateType';

export type StateInfo = {
  handlerPath: string;
  handlerName: string;
};

type CommonStateDefinition = {
  Type: StateType;
  Next?: string;
  End: boolean;
  Comment?: string;
  InputPath?: string;
  OutputPath?: string;
};

export type FailStateDefinition = {
  Type: StateType;
  Comment?: string;
  Cause?: string;
  Error?: string;
};

export type SucceedStateDefinition = {
  Type: StateType;
};

export type ChoiceRule = {
  Variable: string;
  Next?: string;
  And?: ChoiceRule[];
  BooleanEquals?: boolean;
  BooleanEqualsPath?: string;
  IsBoolean?: boolean;
  IsNull?: boolean;
  IsPresent?: boolean;
  IsString?: boolean;
  IsTimestamp?: boolean;
  Not?: ChoiceRule[];
  NumericEquals?: number;
  NumericEqualsPath?: string;
  NumericGreaterThan?: number;
  NumericGreaterThanPath?: string;
  NumericGreaterThanEquals?: number;
  NumericGreaterThanEqualsPath?: string;
  NumericLessThan?: number;
  NumericLessThanPath?: string;
  NumericLessThanEquals?: number;
  NumericLessThanEqualsPath?: string;
  Or?: ChoiceRule[];
  StringEquals?: string;
  StringEqualsPath?: string;
  StringGreaterThan?: string;
  StringGreaterThanPath?: string;
  StringGreaterThanEquals?: string;
  StringGreaterThanEqualsPath?: string;
  StringLessThan?: string;
  StringLessThanPath?: string;
  StringLessThanEquals?: string;
  StringLessThanEqualsPath?: string;
  StringMatches?: string;
  TimestampEquals?: string;
  TimestampEqualsPath?: string;
  TimestampGreaterThan?: string;
  TimestampGreaterThanPath?: string;
  TimestampGreaterThanEquals?: string;
  TimestampGreaterThanEqualsPath?: string;
  TimestampLessThan?: string;
  TimestampLessThanPath?: string;
  TimestampLessThanEquals?: string;
  TimestampLessThanEqualsPath?: string;
};

export type ChoiceStateDefinition = CommonStateDefinition & {
  Choices: ChoiceRule[];
  Default?: string;
};

export type PassStateDefinition = CommonStateDefinition & {
  Result?: Record<any, unknown>;
  ResultPath?: string;
  Parameters?: string; // TODO: TBD
};

export type TaskErrorName =
  | 'State.ALL'
  | 'States.DataLimitExceeded'
  | 'States.Runtime'
  | 'States.Timeout'
  | 'States.TaskFailed'
  | 'States.Permissions';

export type TaskRetryRule = {
  ErrorEquals: TaskErrorName[];
  IntervalSeconds?: number;
  MaxAttempts?: number;
  BackoffRate?: number;
};

export type TaskCatchRule = {
  ErrorEquals: TaskErrorName[];
  Next: string;
  ResultPath?: string;
};

export type TaskStateDefinition = CommonStateDefinition & {
  Resource: string;
  Parameters?: string; // TODO: TBD
  ResultPath?: string;
  ResultSelector?: string;
  Retry?: TaskRetryRule[];
  Catch?: TaskCatchRule[];
  TimeoutSeconds?: number;
  TimeoutSecondsPath?: string;
  HeartbeatSeconds?: number;
  HeartbeatSecondsPath?: string;
};

export type MapStateDefinition = CommonStateDefinition & {};

export type WaitStateDefinition = CommonStateDefinition & {};

export type ParallelStateDefinition = CommonStateDefinition & {};

export type StateDefinition =
  | PassStateDefinition
  | TaskStateDefinition
  | FailStateDefinition
  | SucceedStateDefinition
  | ChoiceStateDefinition;
