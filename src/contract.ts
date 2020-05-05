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

  static getParameters (func: Function) {
    return new RegExp('(?:'+func.name+'\\s*|^)\\s*\\((.*?)\\)').exec(func.toString().replace(/\n/g, ''))[1].replace(/\/\*.*?\*\//g, '').replace(/ /g, '').split(',');
  }

  static OldValue<T> (variableName: string, value: T): T {
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
      const getParameters = this.getParameters;
      const descriptorCall = function (...args: any[]) {
        const result = original.apply(this, args);
        console.log(original.toString())
        console.log(getParameters(original))
        ContractInternal._ensures(condition.apply(null, [result, this]), message);
      }
      descriptor.value = descriptorCall;

      return descriptor;
    }
  }

  static Assume(condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      const descriptorCall = function (...args: any[]) {
        ContractInternal._assume(condition.apply(null, args), message);
        const result = original.apply(this, args);
        return result;
      }

      descriptor.value = descriptorCall;

      return descriptor;
    }
  }
}