import Contract from "./contract";

class Func extends Contract {
  public test: string = "hi";

  decorate (condition: (...conditionArgs: any[]) => boolean, message?: string) {
    return condition();
  }

  constructor() {
    super();
    this.test = "hi!"
  }

  @Contract.Ensures((result: string | null, instance: Func) => result !== null && Contract.OldValue<string>(instance.test) === 'hi!', 'Result should not be null')
  test_ensures (test: string): string | null {
    this.test = 'yo';
    return "hello";
  }

  @Contract.Assume((test: string | null) => test !== null, 'Test cant be null')
  test_assume (test: string): string | null {
    console.log(this.test);
    return test;
  }
}

const f = new Func();
const result = f.test_ensures("no")