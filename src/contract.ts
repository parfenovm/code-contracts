import "reflect-metadata";
import ContractInternal from "./contract-internal";

declare type ContractCondition = (...args: any[]) => boolean;
declare type ContractFunction = (check: boolean, message?: string) => boolean;

const oldValueMetadataKey = Symbol('oldValue');

export default abstract class Contract {
  private _postCondition = 'Ensures';
  private _preCondition = 'Requires'
  private readonly _cache;

  constructor () {
    this._cache = {};
  }

  static OldValue<T> (value: T): T {
    console.log(value);
    return value;
  }

  /**
   * Specifies a postcondition contract for the enclosing method or property.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  static Ensures(condition: (...conditionArgs: any[]) => boolean, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      descriptor.value = function (...args: any[]) {
        const result = original.apply(this, args);
        ContractInternal._ensures(condition.apply(null, [result, this]), message);
      }

      return descriptor;
    }
  }

  static Assume(condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      descriptor.value = function (...args: any[]) {
        ContractInternal._assume(condition.apply(null, args), message);
        const result = original.apply(this, args);
        return result;
      }

      return descriptor;
    }
  }
}