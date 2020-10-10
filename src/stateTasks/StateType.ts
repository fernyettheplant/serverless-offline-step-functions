export enum StateType {
  // Lambda Execution
  Task = 'Task',
  // Should pass input directly to output without doing work
  Pass = 'Pass',
  /**
   * Waits before moving on:
   * - Seconds, SecondsPath: wait the given number of seconds
   * - Timestamp, TimestampPath: wait until the given timestamp
   */
  Wait = 'Wait',
  // Ends the state machine execution with 'success' status
  Succeed = 'Succeed',
  // Ends the state machine execution with 'fail' status
  Fail = 'Fail',
  // Adds branching logic to the state machine
  Choice = 'Choice',
  Parallel = 'Parallel',
}
