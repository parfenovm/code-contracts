import Contract from "../contract";

class Func {
  private test: string;

  constructor() {
    this.test = "hi!"
  }

  @Contract.Ensures((result: string | null) => result !== null && Contract.OldValue(this.test) === 'hi!', 'Result should not be null')
  test_ensures (test: string): string | null {
    this.test = 'yo';
    return "hello";
  }

  @Contract.Assume((test: string) => test !== null, 'Test cant be null')
  test_assume (test: string): string | null {
    console.log(this.test);
    return test;
  }
}

const f = new Func();
const result = f.test_ensures("no")