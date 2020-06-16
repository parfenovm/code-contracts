# js-contracts

C# inspired code contracts. Using typescript decorators we can have postcondition and preconditions

## Installation

```sh
npm install js-contracts --save
```

## Usage

**PLEASE NOTE**

This package relies on use of decorators. For this package to work, you need to enable **experimentalDecorators** option in your tsconfig.json

This packages relies on decorators to implement post and pre conditions. Although some functions
do not require decorators usage, so you can use some functionality of this package in functional code as well.

Methods that rely on usage of post and pre conditions require method and Contract Condition to have same signatures.
If you are using data from 'this' then you need to pass calling class as a last argument. Take a look in examples section for
more details about this case.

**Setup**

Setup contracts with Contract.setSettings first. You can use default settings without setup.
Contracts export Log and ContractFailedError classes for you to extend and define in settings.

## Contract Usage Examples

**Assert**
```
testMethod(argument) {
  Contract.Assert((argument) => argument !== null, 'fail message')(argument);
}
```

**Exists**
```
testMethod(argument) {
  const collection = [1,2,3];
  Contract.Exists(collection, (item) => item !== null, 'fail message');
}
```

**ForAll**
```
testMethod(argument) {
  const collection = [1,2,3];
  Contract.ForAll(collection, (item) => item === null, 'fail message');
}
```

**Requires**

This function requires same amount of arguments as in calling method. If you are using 'this', pass class as a last argument.
```
class Test {
  @Contract.Requires((argument) => argument !== null, 'fail message');
  testMethod(argument) {
    // do something
  }
}
```

Class properties usage
```
class Test {
  constructor() {
    super();

    this.classProperty = null;
  }

  @Contract.Requires((argument, TestClass: Test) => argument !== null && TestClass.classProperty !== null, 'fail message');
  testMethod(argument) {
    // do something
  }
}
```

**Ensures**

This function requires same amount of arguments as in calling method. If you are using 'this', pass class as a last argument.
Additionally you could use function OldValue, OldValueByPath and Result within this function.

Basic example
```
class Test {
  @Contract.Ensures((argument) => argument !== null, 'fail message');
  testMethod(argument) {
    // do something
  }
}
```

OldValue example. OldValue parses the function to cache all arguments first. Path to 'argument' is determined automatically.
```
class Test {
  @Contract.Ensures((argument) => argument === Contract.OldValue(argument), 'fail message');
  testMethod(argument) {
    argument = 'new value';
    return argument;
  }
}
```

OldValueByPath example. OldValueByPath parses the function to cache all arguments first. Path to 'argument' is passed by you.
```
class Test {
  constructor() {
    super();

    this.classProperty = null;
  }

  @Contract.Ensures((argument, TestClass: Test) => argument === Contract.OldValueByPath('TestClass.classProperty'), 'fail message');
  testMethod(argument) {
    argument = 'new value';
    return argument;
  }
}
```

ContractResult example. ContractResult caches function result.
```
class Test {
  constructor() {
    super();

    this.classProperty = null;
  }

  @Contract.Ensures((argument, TestClass: Test) => Contract.ContractResult() === Contract.OldValueByPath('TestClass.classProperty'), 'fail message');
  testMethod(argument) {
    argument = 'new value';
    return argument;
  }
}
```