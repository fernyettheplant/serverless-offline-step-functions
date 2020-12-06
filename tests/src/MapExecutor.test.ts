import { StateTypeExecutorFactory } from '../../src/stateTasks/StateTypeExecutorFactory';
import { StateType } from '../../src/stateTasks/StateType';
import { MapStateDefinition } from '../../src/types/State';
import { StateTypeExecutor } from '../../src/stateTasks/StateTypeExecutor';

describe('Map Executor', () => {
  describe('When the result path and output path are not defined', () => {
    let mapExecutor: StateTypeExecutor;
    let stateDefinition: MapStateDefinition;

    beforeAll(() => {
      mapExecutor = StateTypeExecutorFactory.getExecutor(StateType.Map);
      stateDefinition = {
        Type: StateType.Map,
        Iterator: {} as any,
        End: false,
      };
    });

    it('should return the output array', () => {
      const output = (mapExecutor as any).processOutput({ items: [] }, [], stateDefinition);
      expect(output).toEqual([]);
    });

    it('should return the output array with items', () => {
      const stepOutput = [{ item: 1 }, { item: 2 }];
      const output = (mapExecutor as any).processOutput({ items: [] }, stepOutput, stateDefinition);
      expect(output).toEqual(stepOutput);
    });
  });

  describe('When the result path is defined', () => {
    let mapExecutor: StateTypeExecutor;
    let stateDefinition: MapStateDefinition;

    beforeEach(() => {
      mapExecutor = StateTypeExecutorFactory.getExecutor(StateType.Map);
      stateDefinition = {
        Type: StateType.Map,
        ResultPath: '$.haha',
        Iterator: {} as any,
        End: false,
      };
    });

    it('should return the output in the result path', () => {
      const output = (mapExecutor as any).processOutput({ prop1: 'id1', items: [] }, [], stateDefinition);
      expect(output).toEqual({ prop1: 'id1', items: [], haha: [] });
    });

    it('should return the output in the result path', () => {
      const stepOutput = [{ item: 1 }, { item: 2 }];
      const output = (mapExecutor as any).processOutput({ prop1: 'id1', items: [] }, stepOutput, stateDefinition);
      expect(output).toEqual({ prop1: 'id1', items: [], haha: stepOutput });
    });

    it('should return objects in the array', () => {
      const stepOutput = [{ item: 1 }, { item: 2 }];
      const output = (mapExecutor as any).processOutput({ prop1: 'id1', items: [] }, stepOutput, stateDefinition);
      expect(output.haha[0].item).toEqual(1);
    });
  });

  describe('When the output path is defined', () => {
    let mapExecutor: StateTypeExecutor;
    let stateDefinition: MapStateDefinition;

    beforeEach(() => {
      mapExecutor = StateTypeExecutorFactory.getExecutor(StateType.Map);
      stateDefinition = {
        Type: StateType.Map,
        ResultPath: '$.haha',
        OutputPath: '$.haha',
        Iterator: {} as any,
        End: false,
      };
    });

    it('should return the output in the result path', () => {
      const output = (mapExecutor as any).processOutput({ prop1: 'id1', items: [] }, [], stateDefinition);
      expect(output).toEqual([]);
    });

    it('should return the output in the result path', () => {
      const stepOutput = [{ item: 1 }, { item: 2 }];
      const output = (mapExecutor as any).processOutput({ prop1: 'id1', items: [] }, stepOutput, stateDefinition);
      expect(output).toEqual(stepOutput);
    });

    it('should return the output in the result path', () => {
      stateDefinition.OutputPath = '$.prop1';
      const stepOutput = [{ item: 1 }, { item: 2 }];
      const output = (mapExecutor as any).processOutput({ prop1: 'id1', items: [] }, stepOutput, stateDefinition);
      expect(output).toEqual('id1');
    });
  });
});
