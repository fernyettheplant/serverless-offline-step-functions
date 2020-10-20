import { Retrier } from '../../src/types/Retrier';
import { StatesErrors } from '../../src/types/StatesErrors';

describe('Retrier', () => {
  describe('when the function succeeds', () => {
    it('should call it once', () => {
      const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed] });
      const retriedFunction = jest.fn();
      retrier.retry(retriedFunction);
      expect(retriedFunction).toHaveBeenCalledTimes(1);
    });

    describe('when the function is async', () => {
      it('should call it once', () => {
        const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed] });
        const retriedFunction = jest.fn().mockImplementation(() => Promise.resolve);
        retrier.retry(retriedFunction);
        expect(retriedFunction).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('when the function fails', () => {
    it('should call it 3 times', () => {
      const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed] });
      const retriedFunction = jest.fn().mockImplementation(() => {
        throw new Error('MyError');
      });

      try {
        retrier.retry(retriedFunction);
      } catch (error) {
        expect(error.message).toEqual('MyError');
        expect(retriedFunction).toHaveBeenCalledTimes(3);
      }
    });

    it('should call it 5 times', () => {
      const retrier = Retrier.create({ ErrorEquals: [StatesErrors.TaskFailed], MaxAttempts: 5 });
      const retriedFunction = jest.fn().mockImplementation(() => {
        throw new Error('MyError');
      });

      try {
        retrier.retry(retriedFunction);
      } catch (error) {
        expect(error.message).toEqual('MyError');
        expect(retriedFunction).toHaveBeenCalledTimes(5);
      }
    });
  });
});
