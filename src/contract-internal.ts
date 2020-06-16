import Log from './log';
import _set from 'lodash.set';
import _get from 'lodash.get';
import _clone from 'lodash.clone';
import Contract from './contract';
import { ContractCondition, ContractPredicate, ContractSettings } from './types';
import ContractFailedError from './contract-error';
import crypto from 'crypto';

const RESULT = '__RESULT';

export default class ContractInternal {
  public static _cache = {};
  private static defaultSettings: ContractSettings = { defaultLogger: Log, defaultContractError: ContractFailedError, shouldFailOnCondition: true, shouldLogError: true, shouldSkipContractChecks: false };
  private static _settings: ContractSettings = ContractInternal.defaultSettings;

  public static get shouldSkipContractChecks () {
    return ContractInternal._settings.shouldSkipContractChecks;
  }

  public static _setSettings (settings: ContractSettings) {
    ContractInternal._settings = settings;
  }

  public static initContextParameters (contractInstance: Contract, condition: ContractCondition, target: Object, key: string | symbol) {
    const randomId = crypto.randomBytes(20).toString('hex');
    const hasOldValueParameter = ContractInternal.hasOldValueParameter(condition.toString());
    const populateCache = (...args: any[]) => ContractInternal.populateCache(randomId, target.constructor.name, key, ContractInternal.getParameters(condition), args);
    const populateResultCache = (result: any) => ContractInternal.populateFunctionResultCache(randomId, result, target.constructor.name, key);
    const destroyCache = () => ContractInternal.destroyClassCache(randomId, target.constructor.name, key);
    const bindOldValue = () => {
      Contract.OldValue = ContractInternal._oldValue.bind(this, randomId, target.constructor.name, key, ContractInternal.getOldValueParameter(condition.toString()));
    };
    const bindOldValueByPath = (context: any) => {
      Contract.OldValueByPath = (path: string) => {
        return ContractInternal._oldValue.apply(context, [randomId, target.constructor.name, key, path]);
      };
    };
    const bindFunctionResult = () => {
      Contract.ContractResult = ContractInternal._contractResult.bind(this, randomId, target.constructor.name, key);
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

  public static _ensures<T> (condition: boolean, message?: string): boolean {
    if (!condition) {
      this._executeError(message);
    }

    return condition;
  }

  public static _assert (condition: boolean, message?: string): boolean {
    if (!condition) {
      this._executeError(message);
    }

    return condition;
  }

  public static _exists<T> (collection: T[], predicate: ContractPredicate<T>, message?: string): boolean {
    const result = !!collection.find(predicate);
    if (!result) {
      this._executeError(message);
    }

    return result;
  }

  public static _forAll<T> (collection: T[], predicate: ContractPredicate<T>, message?: string): boolean {
    const result = collection.every(predicate);
    if (!result) {
      this._executeError(message);
    }

    return result;
  }

  public static _requires (condition: boolean, message?: string): boolean {
    if (!condition) {
      this._executeError(message);
    }

    return condition;
  }

  public static _executeError (message?: string) {
    const { shouldFailOnCondition, shouldLogError, defaultLogger, defaultContractError } = this._settings;

    if (shouldFailOnCondition) {
      throw new defaultContractError(message || '');
    } else if (shouldLogError) {
      defaultLogger.log(message);
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

  private static _oldValue<T> (randomId: string, className: string, functionName: string, path: string): T | null {
    const cachedValue = _get(ContractInternal._cache, `${randomId}.${className}.${functionName}.${path}`);
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

  private static populateCache (randomId: string, className: string, functionName: string | symbol, paramsName: string[], values: any[]): void {
    _set(ContractInternal._cache, `${randomId}.${className}.${String(functionName)}`, {});
    for (let i = 0; i < paramsName.length; i++) {
      _set(ContractInternal._cache[randomId][className][functionName], paramsName[i], _clone(values[i]));
    }
  }

  private static populateFunctionResultCache (randomId: string, result: any, className: string, functionName: string | symbol): void {
    if (!_get(ContractInternal._cache, `${randomId}.${className}`)) {
      _set(ContractInternal._cache, `${randomId}.${className}.${String(functionName)}`, {});
    }

    ContractInternal._cache[randomId][className][String(functionName)][RESULT] = result;
  }

  private static destroyClassCache (randomId: string, className: string, functionName: string | Symbol) {
    delete ContractInternal._cache[randomId][className][functionName];
  }

  private static _contractResult (randomId: string, className: string, functionName: string) {
    const cachedValue = _get(ContractInternal._cache, `${randomId}.${className}.${functionName}.${RESULT}`);
    if (!cachedValue) {
      Log.log('Cached value has not been found, replace undefined');
    }

    return cachedValue;
  }
}
