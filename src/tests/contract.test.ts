import Test from './test';
import Contract from '../contract';
import ContractInternal from '../contract-internal';

describe('Actions', () => {
  test('Assert - returns true', () => {
    const TestClass = class Local extends Test {
      testAssert (param) {
        Contract.Assert(param => param !== null, 'fail')(param);
      }
    };
    const spy = jest.spyOn(ContractInternal, '_executeError');
    const test = new TestClass();
    test.testAssert('test');

    expect(spy.mock.calls.length).toBe(0);
  });

  test('Assert - returns false', () => {
    const TestClass = class Local extends Test {
      testAssert (param) {
        Contract.Assert(param => param !== null, 'fail')(param);
      }
    };
    const spy = jest.spyOn(ContractInternal, '_executeError');
    const test = new TestClass();
    test.testAssert(null);

    expect(spy.mock.calls.length).toBe(1);
  });
});
