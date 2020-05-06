import "reflect-metadata";
import ContractInternal from "./contract-internal";
import _set from 'lodash.set';
import _get from 'lodash.get';
import Log from "./log";


declare type ContractCondition = (...args: any[]) => boolean;
declare type ContractFunction = (check: boolean, message?: string) => boolean;

const oldValueMetadataKey = Symbol('oldValue');

export default abstract class Contract {
  private _postCondition = 'Ensures';
  private _preCondition = 'Requires'
  private static _cache = {};

  constructor () {
  }

  static getParameters (func: Function) {
    return new RegExp('(?:'+func.name+'\\s*|^)\\s*\\((.*?)\\)')
      .exec(func.toString().replace(/\n/g, ''))[1]
      .replace(/\/\*.*?\*\//g, '')
      .replace(/ /g, '')
      .split(',');
  }

  static hasOldValueParameter (func: string): boolean {
    return func.indexOf('OldValue') > -1;
  }

  static OldValue<T> (path: string, value: T): T {
    const cachedValue = _get(Contract._cache, path);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace with passed value');
    }

    console.log('cachedValue', cachedValue)
    return cachedValue || value;
  }

  static populateCache (className: string, functionName: string | symbol, paramsName: string[], values: any[]): void {
    _set(Contract._cache, `${className}.${String(functionName)}`, {});
    for (let i = 0; i < paramsName.length; i++) {
      _set(Contract._cache[className][functionName], paramsName[i], values[i]);
    }
  }
  
  static destroyClassCache (className: string) {
    delete Contract._cache[className];
  }

  /**
   * Specifies a postcondition contract for the enclosing method or property.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  static Ensures(condition: (...conditionArgs: any[]) => boolean, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;

      const hasOldValueParameter = this.hasOldValueParameter(condition.toString());
      const populateCache = (...args) => this.populateCache(target.constructor.name, key, this.getParameters(condition), args);
      const destroyCache = () => this.destroyClassCache(target.constructor.name);
      const descriptorCall = function (...args: any[]) {
        if (hasOldValueParameter) {
          populateCache(...args, this);
        }

        const result = original.apply(this, args);
        ContractInternal._ensures(condition.apply(null, [result, this]), message);
        destroyCache();
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