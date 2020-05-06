import Contract from "./contract";

class Func {
  public test: string = "hi";

  constructor() {
    this.test = "hi!"
  }

  @Contract.Ensures((result: string | null, instance: Func) => result !== null && Contract.OldValue<string>(instance.test) === 'hi!', 'Result should not be null')
  test_ensures (test: string, q?: string): string | null {
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