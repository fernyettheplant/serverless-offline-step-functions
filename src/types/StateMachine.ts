import { StateType } from '../stateTasks/StateType';

export type StateMachineDefinition = {
  StartAt: string;
  States: {
    [stateName: string]: StateDefinition;
  };
};

export type StateMachine = {
  name: string;
  definition: StateMachineDefinition;
};

// TODO: Temporal, move to Serverless type
export type StateMachines = {
  [key: string]: StateMachine;
};

export type PassStateDefinition = {
  Type: StateType;
  Next: string;
  End: boolean;
  Comment?: string;
  InputPath?: string;
  OutputPath?: string;
  Result?: Record<any, unknown>;
  ResultPath?: string;
  Parameters?: string; // TODO: TBD
};

export type TaskStateDefinition = {
  Type: StateType;
  Next: string;
  End: boolean;
  Comment?: string;
  InputPath?: string;
  OutputPath?: string;
  Resource: string;
  Parameters?: string; // TODO: TBD
  ResultPath?: string;
  ResultSelector?: string;
  Retry?: Record<any, unknown>[];
  Catch?: Record<any, unknown>[];
  TimeoutSeconds?: number;
  TimeoutSecondsPath?: string;
  HeartbeatSeconds?: number;
  HeartbeatSecondsPath?: string;
};

export type StateDefinition = PassStateDefinition | TaskStateDefinition;
