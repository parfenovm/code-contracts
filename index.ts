import Contract from "./contract";

class Func {
  private test: string;

  constructor() {
    this.test = "hi!"
  }

  @Contract.Ensures((result: string | null) => result !== null, 'Result should not be null')
  test_ensures (test: string): string | null {
    console.log(this.test);
    return null;
  }

  @Contract.Assume((test: string | null) => test !== null, 'Test cant be null')
  test_assume (test: string): string | null {
    console.log(this.test);
    return test;
  }
}

const f = new Func();
const result = f.test_assume(null)