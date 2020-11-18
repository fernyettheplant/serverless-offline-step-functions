import type { StateDefinition } from './State';

export type StateMachineDefinition = {
  StartAt: string;
  States: {
    [stateName: string]: StateDefinition;
  };
};

export type StateMachineDescription = {
  name?: string;
  definition: StateMachineDefinition;
};

// TODO: Temporal, move to Serverless type
export type StateMachinesDescription = {
  [key: string]: StateMachineDescription;
};
