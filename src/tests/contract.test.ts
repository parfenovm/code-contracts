import Test from './mock-class';
import Contract from '../contract';
import ContractInternal from '../contract-internal';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Actions', () => {
  test('Assert - returns true', () => {
    const TestClass = class Local extends Test {
      testAssert (param) {
        Contract.Assert(param => param !== null, 'fail')(param);
      }
    };
    const spy = jest.spyOn(ContractInternal, '_assert');
    const test = new TestClass();
    test.testAssert('test');

    expect(spy.mock.results[0].value).toBe(true);
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

    expect(spy.mock.results[0].value).toBeUndefined();
  });

  test('Exists - returns true', () => {
    const TestClass = class Local extends Test {
      testExists (collection: any[]) {
        Contract.Exists(collection, (item) => item !== null, 'fail');
      }
    };
    const spy = jest.spyOn(ContractInternal, '_exists');
    const test = new TestClass();
    test.testExists(['not null']);

    expect(spy.mock.results[0].value).toBe(true);
  });

  test('Exists - returns false', () => {
    const TestClass = class Local extends Test {
      testExists (collection: any) {
        Contract.Exists(collection, (item) => item !== null, 'fail');
      }
    };
    const spy = jest.spyOn(ContractInternal, '_executeError');
    const test = new TestClass();
    test.testExists([null]);

    expect(spy.mock.results[0].value).toBeUndefined();
  });

  test('ForAll - returns true', () => {
    const TestClass = class Local extends Test {
      testForAll (collection: any[]) {
        Contract.Exists(collection, (item) => item !== null, 'fail');
      }
    };
    const spy = jest.spyOn(ContractInternal, '_exists');
    const test = new TestClass();
    test.testForAll(['not null', 'not null again']);

    expect(spy.mock.results[0].value).toBe(true);
  });

  test('ForAll - returns false', () => {
    const TestClass = class Local extends Test {
      testForAll (collection: any) {
        Contract.Exists(collection, (item) => item !== null, 'fail');
      }
    };
    const spy = jest.spyOn(ContractInternal, '_executeError');
    const test = new TestClass();
    test.testForAll([null]);

    expect(spy.mock.results[0].value).toBeUndefined();
  });

  test('Requires - returns true', () => {
    const testFunc = () => {
      class Local extends Test {
        @Contract.Requires(item => item !== null, 'fail')
        public testRequires (item: any): any {
          return item;
        }
      }

      return Local;
    };

    const TestClass = testFunc();
    const spyReq = jest.spyOn(ContractInternal, '_requires');
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testRequires');
    const test = new TestClass();
    test.testRequires('item');

    expect(spyReq.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.results[0].value).toBe('item');
  });

  test('Requires - returns false', () => {
    const testFunc = () => {
      class Local extends Test {
        constructor () {
          super({ shouldFailOnCondition: true, shouldSkipContractChecks: false, shouldLogError: false });
        }

        @Contract.Requires(item => item !== null, 'fail requires')
        public testRequires (item: any): any {
          return item;
        }
      }

      return Local;
    };

    const TestClass = testFunc();
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testRequires');
    const test = new TestClass();

    expect(() => test.testRequires(null)).toThrowError();
    expect(spyTestRequires.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.results[0].type).toBe('throw');
  });

  test('Ensures - returns true', () => {
    const testFunc = () => {
      class Local extends Test {
        @Contract.Ensures(item => item !== null, 'fail')
        public testEnsures (item: any): any {
          return item;
        }
      }

      return Local;
    };

    const TestClass = testFunc();
    const spyReq = jest.spyOn(ContractInternal, '_ensures');
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testEnsures');
    const test = new TestClass();
    test.testEnsures('item');

    expect(spyReq.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.results[0].value).toBe('item');
  });

  test('Ensures - returns false', () => {
    const testFunc = () => {
      class Local extends Test {
        constructor () {
          super({ shouldFailOnCondition: true, shouldSkipContractChecks: false, shouldLogError: false });
        }

        @Contract.Requires(item => item !== null, 'fail requires')
        public testEnsures (item: any): any {
          return item;
        }
      }

      return Local;
    };

    const TestClass = testFunc();
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testEnsures');
    const test = new TestClass();

    expect(() => test.testEnsures(null)).toThrowError();
    expect(spyTestRequires.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.results[0].type).toBe('throw');
  });
});
