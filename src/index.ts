import Contract from './contract';

class Func {
  public test: string = 'hi';

  constructor () {
    this.test = 'hi!';
  }

  @Contract.Ensures(
    (instance: Func) => Contract.OldValueByPath<string>('instance.test') !== Contract.ContractResult(),
    'Result should not be null'
  )
  test_ensures (): string | null {
    this.test = 'yo';
    return this.test;
  }
}

const f = new Func();
const result = f.test_ensures();
