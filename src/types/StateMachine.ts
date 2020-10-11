import type { StateDefinition } from './State';

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
