import 'reflect-metadata';
import ContractInternal from './contract-internal';
import _set from 'lodash.set';
import _get from 'lodash.get';
import _clone from 'lodash.clone';
import Log from './log';

declare type ContractCondition = (...args: any[]) => boolean;

const RESULT = '__RESULT';

export default abstract class Contract {
  private _postCondition = 'Ensures';
  private _preCondition = 'Requires';
  private static _cache = {};

  constructor() { }

  static getParameters(func: Function) {
    return new RegExp('(?:' + func.name + '\\s*|^)\\s*\\((.*?)\\)')
      .exec(func.toString().replace(/\n/g, ''))[1]
      .replace(/\/\*.*?\*\//g, '')
      .replace(/ /g, '')
      .split(',');
  }

  static hasOldValueParameter(func: string): boolean {
    return func.indexOf('OldValue') > -1;
  }

  static hasResultParameter(func: string): boolean {
    return func.indexOf('ContractResult') > -1;
  }

  private static _oldValue<T>(className: string, functionName: string, path: string): T | null {
    console.log(Contract._cache[className]);
    const cachedValue = _get(Contract._cache, `${className}.${functionName}.${path}`);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace with passed value');
    }

    console.log('cachedValue', cachedValue);
    return cachedValue;
  }

  static getOldValueParameter(func: string): string | null {
    const result = new RegExp(/OldValue\(([^)]+)\)/).exec(func);
    return result && result[1];
  }

  static OldValue<T>(value: T): T {
    return value;
  }

  static OldValueByPath<T>(path: string): T {
    return {} as T;
  }

  private static _contractResult(className: string, functionName: string) {
    const cachedValue = _get(Contract._cache, `${className}.${functionName}.${RESULT}`);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace undefined');
    }

    console.log('cached result', cachedValue);
    return cachedValue;
  }

  static ContractResult() {
    return {};
  }

  static populateCache(className: string, functionName: string | symbol, paramsName: string[], values: any[]): void {
    _set(Contract._cache, `${className}.${String(functionName)}`, {});
    for (let i = 0; i < paramsName.length; i++) {
      _set(Contract._cache[className][functionName], paramsName[i], _clone(values[i]));
    }
  }

  static populateFunctionResultCache(result: any, className: string, functionName: string | symbol): void {
    if (!Contract._cache[className]) {
      _set(Contract._cache, `${className}.${String(functionName)}`, {});
    }

    Contract._cache[className][String(functionName)][RESULT] = result;
  }

  static destroyClassCache(className: string, functionName: string | Symbol) {
    delete Contract._cache[className][functionName];
  }

  /**
   * Specifies a postcondition contract for the enclosing method or property.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  static Ensures(condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;

      const { bindOldValue, bindOldValueByPath, bindFunctionResult, hasOldValueParameter, populateCache, populateResultCache, destroyCache } = Contract.initContextParameters(condition, target, key);
      const descriptorCall = function (...args: any[]) {
        bindOldValue();
        bindOldValueByPath(this);
        bindFunctionResult();

        if (hasOldValueParameter) {
          populateCache(...args, this);
        }

        const result = original.apply(this, args);
        populateResultCache(result);
        ContractInternal._ensures(condition.apply(null, [...args, this]), message);
        destroyCache();
      };
      descriptor.value = descriptorCall;

      return descriptor;
    };
  }

  static Assume(condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      const descriptorCall = function (...args: any[]) {
        ContractInternal._assume(condition.apply(null, args), message);
        const result = original.apply(this, args);
        return result;
      };

      descriptor.value = descriptorCall;

      return descriptor;
    };
  }

  private static initContextParameters(condition: ContractCondition, target: Object, key: string | symbol) {
    const hasOldValueParameter = Contract.hasOldValueParameter(condition.toString());
    const populateCache = (...args: any[]) => Contract.populateCache(target.constructor.name, key, Contract.getParameters(condition), args);
    const populateResultCache = (result: any) => Contract.populateFunctionResultCache(result, target.constructor.name, key);
    const destroyCache = () => Contract.destroyClassCache(target.constructor.name, key);
    const bindOldValue = () => {
      Contract.OldValue = Contract._oldValue.bind(this, target.constructor.name, key, Contract.getOldValueParameter(condition.toString()));
    };
    const bindOldValueByPath = (context: any) => {
      Contract.OldValueByPath = (path: string) => {
        return Contract._oldValue.apply(context, [target.constructor.name, key, path]);
      };
    };
    const bindFunctionResult = () => {
      Contract.ContractResult = Contract._contractResult.bind(this, target.constructor.name, key);
    };

    return {
      hasOldValueParameter,
      populateCache,
      populateResultCache,
      destroyCache,
      bindOldValue,
      bindOldValueByPath,
      bindFunctionResult
    };
  }
}
