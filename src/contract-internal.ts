import Log from './log';
import _set from 'lodash.set';
import _get from 'lodash.get';
import _clone from 'lodash.clone';
import Contract from './contract';
import { ContractCondition, ContractPredicate, ContractSettings } from './types';
import ContractFailedError from './contract-error';

const RESULT = '__RESULT';

export default class ContractInternal {
  private static _cache = {};
  private static _settings: ContractSettings;

  public static get shouldSkipContractChecks () {
    return ContractInternal._settings.shouldSkipContractChecks;
  }

  public static _setSettings (settings: ContractSettings) {
    this._settings = settings;
  }

  public static initContextParameters (contractInstance: Contract, condition: ContractCondition, target: Object, key: string | symbol) {
    const hasOldValueParameter = ContractInternal.hasOldValueParameter(condition.toString());
    const populateCache = (...args: any[]) => ContractInternal.populateCache(target.constructor.name, key, ContractInternal.getParameters(condition), args);
    const populateResultCache = (result: any) => ContractInternal.populateFunctionResultCache(result, target.constructor.name, key);
    const destroyCache = () => ContractInternal.destroyClassCache(target.constructor.name, key);
    const bindOldValue = () => {
      Contract.OldValue = ContractInternal._oldValue.bind(this, target.constructor.name, key, ContractInternal.getOldValueParameter(condition.toString()));
    };
    const bindOldValueByPath = (context: any) => {
      Contract.OldValueByPath = (path: string) => {
        return ContractInternal._oldValue.apply(context, [target.constructor.name, key, path]);
      };
    };
    const bindFunctionResult = () => {
      Contract.ContractResult = ContractInternal._contractResult.bind(this, target.constructor.name, key);
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

  public static _ensures<T extends Error> (condition: boolean, message?: string): boolean {
    if (!condition) {
      this.executeError<T>(message);
    }

    return condition;
  }

  public static _assert<T extends Error> (condition: boolean, message?: string): boolean {
    if (!condition) {
      this.executeError<T>(message);
    }

    return condition;
  }

  public static _exists<T, E extends Error> (collection: T[], predicate: ContractPredicate<T>, message?: string): boolean {
    const result = !!collection.find(predicate);
    if (!result) {
      this.executeError<E>(message);
    }

    return result;
  }

  public static _forAll<T, E extends Error> (collection: T[], predicate: ContractPredicate<T>, message?: string): boolean {
    const result = collection.every(predicate);
    if (!result) {
      this.executeError<E>(message);
    }

    return result;
  }

  public static _requires<T extends Error> (condition: boolean, message?: string): boolean {
    if (!condition) {
      this.executeError<T>(message);
    }

    return condition;
  }

  private static executeError<T extends Error = ContractFailedError> (message?: string) {
    const { shouldFailOnCondition } = this._settings;

    if (shouldFailOnCondition) {
      const error = { message: message } as T;
      throw error;
    } else {
      Log.log(message);
    }
  }

  private static getParameters (func: Function) {
    const regex = new RegExp('(?:' + func.name + '\\s*|^)\\s*\\((.*?)\\)')
      .exec(func.toString().replace(/\n/g, ''));
    if (regex === null) {
      throw new Error(`No parameters found for function ${func.toString()}`);
    }

    return regex[1]
      .replace(/\/\*.*?\*\//g, '')
      .replace(/ /g, '')
      .split(',');
  }

  private static hasOldValueParameter (func: string): boolean {
    return func.indexOf('OldValue') > -1;
  }

  private static hasResultParameter (func: string): boolean {
    return func.indexOf('ContractResult') > -1;
  }

  private static _oldValue<T> (className: string, functionName: string, path: string): T | null {
    console.log(ContractInternal._cache[className]);
    const cachedValue = _get(ContractInternal._cache, `${className}.${functionName}.${path}`);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace with passed value');
    }

    console.log('cachedValue', cachedValue);
    return cachedValue;
  }

  private static getOldValueParameter (func: string): string | null {
    const result = new RegExp(/OldValue\(([^)]+)\)/).exec(func);
    return result && result[1];
  }

  private static populateCache (className: string, functionName: string | symbol, paramsName: string[], values: any[]): void {
    _set(ContractInternal._cache, `${className}.${String(functionName)}`, {});
    for (let i = 0; i < paramsName.length; i++) {
      _set(ContractInternal._cache[className][functionName], paramsName[i], _clone(values[i]));
    }
  }

  private static populateFunctionResultCache (result: any, className: string, functionName: string | symbol): void {
    if (!ContractInternal._cache[className]) {
      _set(ContractInternal._cache, `${className}.${String(functionName)}`, {});
    }

    ContractInternal._cache[className][String(functionName)][RESULT] = result;
  }

  private static destroyClassCache (className: string, functionName: string | Symbol) {
    delete ContractInternal._cache[className][functionName];
  }

  private static _contractResult (className: string, functionName: string) {
    const cachedValue = _get(ContractInternal._cache, `${className}.${functionName}.${RESULT}`);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace undefined');
    }

    console.log('cached result', cachedValue);
    return cachedValue;
  }
}
