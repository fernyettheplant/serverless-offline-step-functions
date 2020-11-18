import { Context } from '../../src/Context/Context';
import { Retrier } from '../../src/types/Retrier';
import { StatesErrors } from '../../src/types/StatesErrors';
import { Logger } from '../../src/utils/Logger';

describe('Retrier', () => {
  const context = ({
    Task: { Token: 'OneTaskToken' },
    Execution: { Id: 'MyExecutionId' },
    State: { EnteredTime: 'MyEnteredTime' },
    StateMachine: { Id: 'MyStateMachineId' },
  } as unknown) as Context;

  beforeAll(() => {
    Logger.getInstance = jest.fn().mockReturnValue({ error: jest.fn(), log: jest.fn() });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the function succeeds', () => {
    it('should call it once', async () => {
      const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed] });
      const retriedFunction = jest.fn();
      await retrier.retry(retriedFunction, context);
      expect(retriedFunction).toHaveBeenCalledTimes(1);
    });

    describe('when the function is async', () => {
      it('should call it once', async () => {
        const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed] });
        const retriedFunction = jest.fn().mockImplementation(() => Promise.resolve);
        await retrier.retry(retriedFunction, context);
        expect(retriedFunction).toHaveBeenCalledTimes(1);
      });
    });
  });

  // 1 Call + 3 retries
  describe('when the function fails', () => {
    it('should call it 4 times', (done) => {
      expect.assertions(2);

      const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed] });
      const retriedFunction = jest.fn().mockImplementation(() => {
        throw new Error('MyError');
      });

      retrier.retry(retriedFunction, context).catch((error) => {
        expect(error.message).toEqual('MyError');
        expect(retriedFunction).toHaveBeenCalledTimes(4);
        done();
      });
      jest.runAllTimers();
    });

    // 1 Call + 5 retries
    it('should call it 6 times', (done) => {
      expect.assertions(2);

      const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed], MaxAttempts: 5 });
      const retriedFunction = jest.fn().mockImplementation(() => {
        throw new Error('MyError');
      });

      retrier.retry(retriedFunction, context).catch((error) => {
        expect(error.message).toEqual('MyError');
        expect(retriedFunction).toHaveBeenCalledTimes(6);
        done();
      });
      jest.runAllTimers();
    });

    it('should call it with correct interval', (done) => {
      expect.assertions(5);

      const retrier = Retrier.create({
        ErrorEquals: [StatesErrors.TaskFailed],
        MaxAttempts: 5,
        BackoffRate: 2.0,
        IntervalSeconds: 5,
      });

      const retriedFunction = jest.fn().mockImplementation(() => {
        throw new Error('MyError');
      });

      retrier.retry(retriedFunction, context).catch(() => {
        expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function), 5 * 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 10 * 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(3, expect.any(Function), 20 * 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(4, expect.any(Function), 40 * 1000);
        expect(setTimeout).toHaveBeenNthCalledWith(5, expect.any(Function), 80 * 1000);
        done();
      });
      jest.runAllTimers();
    });
  });
});
