import { Context } from '../../src/Context/Context';
import { StateProcessor } from '../../src/StateProcessor';

describe('StateProcessor', () => {
  const context = ({
    Task: { Token: 'OneTaskToken' },
    Execution: { Id: 'MyExecutionId' },
    State: { EnteredTime: 'MyEnteredTime' },
    StateMachine: { Id: 'MyStateMachineId' },
  } as unknown) as Context;
  describe('Parameters', () => {
    describe('When there is a waitForTaskToken', () => {
      describe('When the resource is a lambda', () => {
        it('should throw if FunctionName is not defined', () => {
          expect(() => StateProcessor.processWaitForTokenParameters('{}', {}, context)).toThrow(
            `The field 'FunctionName' is required but was missing`,
          );
        });

        it(`should throw if there are extra fields that isn't part of the lambda`, () => {
          expect(() =>
            StateProcessor.processWaitForTokenParameters(
              '{}',
              { FunctionName: 'funcName', Something: 'a string' },
              context,
            ),
          ).toThrow(`The field "Something" is not supported by Step Functions`);
        });

        describe('When the Payload is undefined', () => {
          ['{}', '{"something1": "something2", "haha": 123}'].map((val, index) => {
            it(`should return nothing - ${index}`, () => {
              const result = StateProcessor.processWaitForTokenParameters(val, { FunctionName: 'funcName' }, context);

              expect(result).toEqual('{}');
            });
          });
        });

        describe('When the Payload is empty', () => {
          ['{}', '{"something1": "something2", "haha": 123}'].map((val, index) => {
            it(`should return nothing - ${index}`, () => {
              const result = StateProcessor.processWaitForTokenParameters(
                val,
                { FunctionName: 'funcName', Payload: {} },
                context,
              );

              expect(result).toEqual('{}');
            });
          });
        });

        describe('When the Payload is a constant JSON', () => {
          [
            { A: 'A', B: 123, C: { D: 'D' } },
            { A: 'AElse', B: 123, C: { D: 'D' } },
          ].map((Payload, index) => {
            it(`should return stringified JSON - ${index}`, () => {
              const result = StateProcessor.processWaitForTokenParameters(
                '',
                { FunctionName: 'funcName', Payload },
                context,
              );

              expect(result).toEqual(JSON.stringify(Payload));
            });

            it(`should return stringified JSON - ${index}`, () => {
              const result = StateProcessor.processWaitForTokenParameters(
                '{"something1": "something2", "haha": 123}',
                {
                  FunctionName: 'funcName',
                  Payload,
                },
                context,
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
              context,
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
              context,
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
              context,
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
              context,
            );

            expect(result).toEqual(
              JSON.stringify({
                Something: {
                  foo: 'OneTaskToken',
                },
              }),
            );
          });
        });
      });
    });

    describe('When there is a no waitForTaskToken', () => {
      describe('When the Payload is undefined', () => {
        ['{}', '{"something1": "something2", "haha": 123}'].map((val, index) => {
          it(`should return nothing - ${index}`, () => {
            const result = StateProcessor.processParameters(val, undefined, context);

            expect(result).toEqual(val);
          });
        });
      });

      describe('When the Payload is empty', () => {
        ['{}', '{"something1": "something2", "haha": 123}'].map((val, index) => {
          it(`should return nothing - ${index}`, () => {
            const result = StateProcessor.processParameters(val, {}, context);

            expect(result).toEqual('{}');
          });
        });
      });

      describe('When the Payload is a constant JSON', () => {
        [
          { A: 'A', B: 123, C: { D: 'D' } },
          { A: 'AElse', B: 123, C: { D: 'D' } },
        ].map((Payload, index) => {
          it(`should return stringified JSON - ${index}`, () => {
            const result = StateProcessor.processParameters('', Payload, context);

            expect(result).toEqual(JSON.stringify(Payload));
          });

          it(`should return stringified JSON - ${index}`, () => {
            const result = StateProcessor.processParameters(
              '{"something1": "something2", "haha": 123}',
              Payload,
              context,
            );

            expect(result).toEqual(JSON.stringify(Payload));
          });
        });
      });

      describe('When the Payload has a path at the root', () => {
        it(`should fill that path`, () => {
          const result = StateProcessor.processParameters(
            '{"something1": "something2", "haha": 123}',
            {
              'Something.$': '$.haha',
            },
            context,
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
          const result = StateProcessor.processParameters(
            '{"something1": "something2", "haha": 123, "foo": {"bar": 456}}',
            {
              'Something.$': '$.foo.bar',
            },
            context,
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
          const result = StateProcessor.processParameters(
            '{"something1": "something2", "haha": 123, "foo": {"bar": 456}}',
            {
              Something: {
                'foo.$': '$.foo.bar',
              },
            },
            context,
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
    });
  });

  describe('ItemsPath', () => {
    describe('When the ItemsPaths is incorrect', () => {
      it('should throw and error', () => {
        expect(() =>
          StateProcessor.processItemsPath('{"something1": "something2", "iterator": [1, 2] }', '$.items'),
        ).toThrow('Could not find itemsPath "$.items" in JSON "{"something1": "something2", "iterator": [1, 2] }"');
      });
    });

    describe('When the ItemsPaths is correct', () => {
      it('should return the correct JSON', () => {
        const result = StateProcessor.processItemsPath(
          '{"something1": "something2", "iterator": [1, 2] }',
          '$.iterator',
        );
        expect(result).toEqual(JSON.stringify([1, 2]));
      });
    });
  });

  describe('ResultPath', () => {
    const input = { val1: '123123' };

    describe('When the ResultPath is empty', () => {
      [{}, { something1: 'something2', haha: 123 }].map((val, index) => {
        it(`should return nothing - ${index}`, () => {
          const result = StateProcessor.processResultPath(input, val);

          expect(result).toEqual(JSON.stringify(val));
        });
      });
    });

    describe('When the ResultPath is $', () => {
      [{}, { something1: 'something2', haha: 123 }].map((val, index) => {
        it(`should return nothing - ${index}`, () => {
          const result = StateProcessor.processResultPath(input, val, '$');

          expect(result).toEqual(JSON.stringify(val));
        });
      });
    });

    describe('When the ResultPath is defined', () => {
      [{}, { something1: 'something2', haha: 123 }].map((val, index) => {
        it(`should return nothing - ${index}`, () => {
          const result = StateProcessor.processResultPath(input, val, '$.somewhere');

          expect(result).toEqual(
            JSON.stringify({
              ...input,
              somewhere: val,
            }),
          );
        });
      });
    });

    describe('When the ResultPath is defined and deeply nested', () => {
      [{}, { something1: 'something2', haha: 123 }].map((val, index) => {
        it(`should return nothing - ${index}`, () => {
          const result = StateProcessor.processResultPath(input, val, '$.A.B');

          expect(result).toEqual(
            JSON.stringify({
              ...input,
              A: {
                B: val,
              },
            }),
          );
        });
      });
    });
  });

  describe('When there is a no waitForTaskToken', () => {
    describe('When the Payload is undefined', () => {
      ['{}', '{"something1": "something2", "haha": 123}'].map((val, index) => {
        it(`should return nothing - ${index}`, () => {
          const result = StateProcessor.processParameters(val, undefined, context);

          expect(result).toEqual(val);
        });
      });
    });

    describe('When the Payload is empty', () => {
      ['{}', '{"something1": "something2", "haha": 123}'].map((val, index) => {
        it(`should return nothing - ${index}`, () => {
          const result = StateProcessor.processParameters(val, {}, context);

          expect(result).toEqual('{}');
        });
      });
    });

    describe('When the Payload is a constant JSON', () => {
      [
        { A: 'A', B: 123, C: { D: 'D' } },
        { A: 'AElse', B: 123, C: { D: 'D' } },
      ].map((Payload, index) => {
        it(`should return stringified JSON - ${index}`, () => {
          const result = StateProcessor.processParameters('', Payload, context);

          expect(result).toEqual(JSON.stringify(Payload));
        });

        it(`should return stringified JSON - ${index}`, () => {
          const result = StateProcessor.processParameters(
            '{"something1": "something2", "haha": 123}',
            Payload,
            context,
          );

          expect(result).toEqual(JSON.stringify(Payload));
        });
      });
    });

    describe('When the Payload has a path at the root', () => {
      it(`should fill that path`, () => {
        const result = StateProcessor.processParameters(
          '{"something1": "something2", "haha": 123}',
          {
            'Something.$': '$.haha',
          },
          context,
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
        const result = StateProcessor.processParameters(
          '{"something1": "something2", "haha": 123, "foo": {"bar": 456}}',
          {
            'Something.$': '$.foo.bar',
          },
          context,
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
        const result = StateProcessor.processParameters(
          '{"something1": "something2", "haha": 123, "foo": {"bar": 456}}',
          {
            Something: {
              'foo.$': '$.foo.bar',
            },
          },
          context,
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
  });
});
