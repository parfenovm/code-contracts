import "reflect-metadata";
import ContractInternal from "./contract-internal";
import _set from 'lodash.set';
import _get from 'lodash.get';
import Log from "./log";


declare type ContractCondition = (...args: any[]) => boolean;
declare type ContractFunction = (check: boolean, message?: string) => boolean;

const RESULT = '__RESULT';

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

  static hasResultParameter (func: string): boolean {
    return func.indexOf('ContractResult') > -1;
  }
  
  private static _oldValue<T> (className: string, functionName: string, path: string): T | null {
    console.log(Contract._cache[className])
    const cachedValue = _get(Contract._cache, `${className}.${functionName}.${path}`);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace with passed value');
    }

    console.log('cachedValue', cachedValue)
    return cachedValue;
  }

  static getOldValueParameter (func: string): string | null {
    const result = new RegExp(/OldValue\(([^)]+)\)/).exec(func);
    return result && result[1];
  }

  static OldValue<T> (value: T): T {
    return value;
  }

  static ContractResult (path: string) {
    const cachedValue = _get(Contract._cache, `${path}.${RESULT}`);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace undefined');
    }

    console.log('cached result', cachedValue)
    return cachedValue;
  }

  static populateCache (className: string, functionName: string | symbol, paramsName: string[], values: any[]): void {
    _set(Contract._cache, `${className}.${String(functionName)}`, {});
    for (let i = 0; i < paramsName.length; i++) {
      _set(Contract._cache[className][functionName], paramsName[i], values[i]);
    }
  }

  static populateFunctionResultCache (result: any, className: string, functionName: string | symbol): void {
    if (!Contract._cache[className]) {
      _set(Contract._cache, `${className}.${String(functionName)}`, {});
    }

    Contract._cache[className][String(functionName)][RESULT] = result;
  }

  static destroyClassCache (className: string, functionName: string | Symbol) {
    delete Contract._cache[className][functionName];
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
      const populateResultCache = (result) => this.populateFunctionResultCache(result, target.constructor.name, key);
      const destroyCache = () => this.destroyClassCache(target.constructor.name, key);
      const test = (s: any, className: string, callee: string | Symbol) => {
        s.className = target.constructor.name;
        s.funcName = callee;
        this.OldValue = this._oldValue.bind(this, className, key, this.getOldValueParameter(condition.toString()))
      }
      const call = () => console.log(Contract._cache);
      const descriptorCall = function (...args: any[]) {
        test(this, target.constructor.name, key);
        
        if (hasOldValueParameter) {
          populateCache(...args, this);
        }

        const result = original.apply(this, args);
        populateResultCache(result);
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