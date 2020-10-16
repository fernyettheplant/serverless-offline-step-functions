import { StateProcessor } from '../../src/StateProcessor';

describe('StateProcessor', () => {
  describe('When there is a waitForTaskToken', () => {
    describe('When the resource is a lambda', () => {
      it('should throw if FunctionName is not defined', () => {
        expect(() =>
          StateProcessor.processWaitForTokenParameters('{}', {}),
        ).toThrow(`The field 'FunctionName' is required but was missing`);
      });

      it(`should throw if there are extra fields that isn't part of the lambda`, () => {
        expect(() =>
          StateProcessor.processWaitForTokenParameters('{}', {
            FunctionName: 'funcName',
            Something: 'a string',
          }),
        ).toThrow(`The field "Something" is not supported by Step Functions`);
      });

      describe('When the Payload is undefined', () => {
        ['{}', '{"something1": "something2", "haha": 123}'].map(
          (val, index) => {
            it(`should return nothing - ${index}`, () => {
              const result = StateProcessor.processWaitForTokenParameters(val, {
                FunctionName: 'funcName',
              });

              expect(result).toEqual('{}');
            });
          },
        );
      });

      describe('When the Payload is empty', () => {
        ['{}', '{"something1": "something2", "haha": 123}'].map(
          (val, index) => {
            it(`should return nothing - ${index}`, () => {
              const result = StateProcessor.processWaitForTokenParameters(val, {
                FunctionName: 'funcName',
                Payload: {},
              });

              expect(result).toEqual('{}');
            });
          },
        );
      });

      describe('When the Payload is a constant JSON', () => {
        [
          { A: 'A', B: 123, C: { D: 'D' } },
          { A: 'AElse', B: 123, C: { D: 'D' } },
        ].map((Payload, index) => {
          it(`should return stringified JSON - ${index}`, () => {
            const result = StateProcessor.processWaitForTokenParameters('', {
              FunctionName: 'funcName',
              Payload,
            });

            expect(result).toEqual(JSON.stringify(Payload));
          });

          it(`should return stringified JSON - ${index}`, () => {
            const result = StateProcessor.processWaitForTokenParameters(
              '{"something1": "something2", "haha": 123}',
              {
                FunctionName: 'funcName',
                Payload,
              },
            );

            expect(result).toEqual(JSON.stringify(Payload));
          });
        });
      });

      describe('When the Payload has a path at the root', () => {
        it(`should fill that path`, () => {
          const result = StateProcessor.processWaitForTokenParameters(
            '{"something1": "something2", "haha": 123}',
            {
              FunctionName: 'funcName',
              Payload: {
                'Something.$': '$.haha',
              },
            },
          );

          expect(result).toEqual(
            JSON.stringify({
              Something: 123,
            }),
          );
        });
      });

      describe('When the Payload has a nested path', () => {
        it(`should fill that path`, () => {
          const result = StateProcessor.processWaitForTokenParameters(
            '{"something1": "something2", "haha": 123, "foo": {"bar": 456}}',
            {
              FunctionName: 'funcName',
              Payload: {
                'Something.$': '$.foo.bar',
              },
            },
          );

          expect(result).toEqual(
            JSON.stringify({
              Something: 456,
            }),
          );
        });
      });

      describe('When the Payload has a deeply nested path', () => {
        it(`should fill that path`, () => {
          const result = StateProcessor.processWaitForTokenParameters(
            '{"something1": "something2", "haha": 123, "foo": {"bar": 456}}',
            {
              FunctionName: 'funcName',
              Payload: {
                Something: {
                  'foo.$': '$.foo.bar',
                },
              },
            },
          );

          expect(result).toEqual(
            JSON.stringify({
              Something: {
                foo: 456,
              },
            }),
          );
        });
      });

      describe('When the Payload has a ContextObject path', () => {
        it(`should fill that path`, () => {
          const result = StateProcessor.processWaitForTokenParameters(
            '{"something1": "something2", "haha": 123, "foo": {"bar": 456}}',
            {
              FunctionName: 'funcName',
              Payload: {
                Something: {
                  'foo.$': '$$.Task.Token',
                },
              },
            },
          );

          expect(result).toEqual(
            JSON.stringify({
              Something: {
                foo: 'Task.Token',
              },
            }),
          );
        });
      });
    });
  });
});
