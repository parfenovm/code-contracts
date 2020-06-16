import Test from './mock-class';
import Contract from '../contract';
import ContractInternal from '../contract-internal';
import Log from '../log';
import ContractFailedError from '../contract-error';

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
          super({ shouldFailOnCondition: true, shouldSkipContractChecks: false, shouldLogError: false, defaultLogger: Log, defaultContractError: ContractFailedError });
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
          super({ shouldFailOnCondition: true, shouldSkipContractChecks: false, shouldLogError: false, defaultContractError: ContractFailedError, defaultLogger: Log });
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

describe('Test Ensures', () => {
  test('Ensures - access OldValue by variable name', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        @Contract.Ensures(item => Contract.OldValue(item) !== null, 'fail')
        public testEnsures (item: any): any {
          return item;
        }
      }

      return EnsuresLocal;
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

  test('Ensures - access OldValue by path', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        @Contract.Ensures(item => Contract.OldValueByPath('item') !== null, 'fail')
        public testEnsures (item: any): any {
          return item;
        }
      }

      return EnsuresLocal;
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

  test('Ensures - access OldValue - change value in function', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        @Contract.Ensures(item => Contract.OldValue(item) !== null, 'fail')
        public testEnsures (item: any): any {
          item = null;
          return item;
        }
      }

      return EnsuresLocal;
    };

    const TestClass = testFunc();
    const spyReq = jest.spyOn(ContractInternal, '_ensures');
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testEnsures');
    const test = new TestClass();
    test.testEnsures('item');

    expect(spyReq.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.results[0].value).toBe(null);
  });

  test('Ensures - access Result', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        @Contract.Ensures(item => Contract.ContractResult() !== null, 'fail')
        public testEnsures (item: any): any {
          return item;
        }
      }

      return EnsuresLocal;
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

  test('Ensures - access Result and OldValue', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        @Contract.Ensures(item => Contract.ContractResult() !== Contract.OldValue(item), 'fail')
        public testEnsures (item: any): any {
          item = null;
          return item;
        }
      }

      return EnsuresLocal;
    };

    const TestClass = testFunc();
    const spyReq = jest.spyOn(ContractInternal, '_ensures');
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testEnsures');
    const test = new TestClass();
    test.testEnsures('item');

    expect(spyReq.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.results[0].value).toBe(null);
  });

  test('Ensures - access class this instance', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        private field: string = 'test';

        @Contract.Ensures((item: any, EnsuresLocal: EnsuresLocal) => Contract.ContractResult() !== EnsuresLocal.field, 'fail')
        public testEnsures (item: any): any {
          return item;
        }
      }

      return EnsuresLocal;
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

  test('Ensures - access class cache this instance with empty field', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        private field: string = 'test';

        @Contract.Ensures((EnsuresLocal: EnsuresLocal) => Contract.OldValue(EnsuresLocal.field) === 'test' && Contract.ContractResult() === EnsuresLocal.field, 'fail')
        public testEnsures (): any {
          return this.field;
        }
      }

      return EnsuresLocal;
    };

    const TestClass = testFunc();
    const spyReq = jest.spyOn(ContractInternal, '_ensures');
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testEnsures');
    const test = new TestClass();
    test.testEnsures();

    expect(spyReq.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.calls.length).toBe(1);
  });

  test('Ensures - access class cache this instance with empty fields and modify field', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        private field: string = 'test';

        @Contract.Ensures((EnsuresLocal: EnsuresLocal) => Contract.OldValue(EnsuresLocal.field) === 'test' && Contract.ContractResult() !== 'test', 'fail')
        public testEnsures (): any {
          this.field = 'new test';
          return this.field;
        }
      }

      return EnsuresLocal;
    };

    const TestClass = testFunc();
    const spyReq = jest.spyOn(ContractInternal, '_ensures');
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testEnsures');
    const test = new TestClass();
    test.testEnsures();

    expect(spyReq.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.calls.length).toBe(1);
  });

  test('Ensures - no return function', () => {
    const testFunc = () => {
      class EnsuresLocal extends Test {
        private field: string = 'test';

        @Contract.Ensures((EnsuresLocal: EnsuresLocal) => Contract.OldValue(EnsuresLocal.field) === 'test', 'fail')
        public testEnsures (): any {
          this.field = 'new test';
        }
      }

      return EnsuresLocal;
    };

    const TestClass = testFunc();
    const spyReq = jest.spyOn(ContractInternal, '_ensures');
    const spyTestRequires = jest.spyOn(TestClass.prototype, 'testEnsures');
    const test = new TestClass();
    test.testEnsures();

    expect(spyReq.mock.calls.length).toBe(1);
    expect(spyTestRequires.mock.calls.length).toBe(1);
  });

  test('Ensures - cache is cleaned after function call', () => {
    const testFunc = () => {
      class EnsuresLocalCacheTest extends Test {
        private field: string = 'test';

        @Contract.Ensures((EnsuresLocal: EnsuresLocalCacheTest) => Contract.OldValue(EnsuresLocal.field) === 'test', 'fail')
        public testEnsures (): any {
          this.field = 'new test';
        }
      }

      return EnsuresLocalCacheTest;
    };

    const TestClass = testFunc();
    const test = new TestClass();
    test.testEnsures();

    const item: any = Object.values(ContractInternal._cache).find((x: any) => x['EnsuresLocalCacheTest']);
    expect(item).toBeDefined();
    expect(Object.values(item.EnsuresLocalCacheTest).length).toBe(0);
  });
});
