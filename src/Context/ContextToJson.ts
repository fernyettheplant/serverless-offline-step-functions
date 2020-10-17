import { Context } from './Context';
import {
  ContextType,
  ExecutionContextType,
  StateContextType,
  StateMachineContextType,
  TaskContextType,
} from './ContextType';
import { ExecutionContext } from './ExecutionContext';
import { StateContext } from './StateContext';
import { StateMachineContext } from './StateMachineContext';
import { TaskContext } from './TaskContext';

export const ContextToJson = (context: Context): ContextType => {
  return {
    Task: TaskContextToJson(context.Task),
    Execution: ExecutionContextToJson(context.Execution),
    State: StateContextToJson(context.State),
    StateMachine: StateMachineContextToJson(context.StateMachine),
  };
};

const TaskContextToJson = (taskContext: TaskContext): TaskContextType => {
  return {
    Token: taskContext.Token,
  };
};

const ExecutionContextToJson = (executionContext: ExecutionContext): ExecutionContextType => {
  return {
    Id: executionContext.Id,
    Input: executionContext.Input,
    Name: executionContext.Name,
    RoleArn: executionContext.RoleArn,
    StartTime: executionContext.StartTime,
  };
};

const StateContextToJson = (stateContext: StateContext): StateContextType => {
  return {
    EnteredTime: stateContext.EnteredTime,
    Name: stateContext.Name,
    RetryCount: stateContext.RetryCount,
  };
};

const StateMachineContextToJson = (stateMachineContext: StateMachineContext): StateMachineContextType => {
  return {
    Id: stateMachineContext.Id,
    Name: stateMachineContext.Name,
  };
};
