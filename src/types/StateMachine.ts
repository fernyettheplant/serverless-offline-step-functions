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

export type StateDefinition = {
  Type: string;
  Resource: string;
  Next: string;
  End: boolean;
  InputPath?: string;
  ResultPath?: string;
  OutputPath?: string;
};
