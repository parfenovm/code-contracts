class Main {
  private test: string;
  public goMainProp = () => console.log(this.test);

  constructor () {
    this.test = 'test';
  }

  goMain() {
    return Test.goTest(() => console.log(this.test))
  }
}

class Test {
  static goTest(func) {
    return () => {
      const f = function () {
        func()
      }
      f();
    }
  };
}

const main = new Main();
const test = new Test();
