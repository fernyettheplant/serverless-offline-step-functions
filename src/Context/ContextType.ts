export type ContextType = {
  Execution: ExecutionContextType;
  State: StateContextType;
  StateMachine: StateMachineContextType;
  Task: TaskContextType;
};

export type StateContextType = {
  EnteredTime: string; // '2019-03-26T20:14:13.192Z'
  Name: string;
  RetryCount: number;
};

export type StateMachineContextType = {
  Id: string; // 'arn:aws:states:us-east-1:123456789012:stateMachine:stateMachineName'
  Name: string;
};

export type TaskContextType = {
  Token: string;
};

export type ExecutionContextType = {
  Id: string; // 'arn:aws:states:us-east-1:123456789012:execution:stateMachineName:executionName'
  Input: string | undefined;
  Name: string;
  RoleArn: string; // 'arn:aws:iam::123456789012:role...'
  StartTime: string; // '2019-03-26T20:14:13.192Z';
};
