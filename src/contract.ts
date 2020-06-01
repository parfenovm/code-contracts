import 'reflect-metadata';
import ContractInternal from './contract-internal';
import _set from 'lodash.set';
import _get from 'lodash.get';
import _clone from 'lodash.clone';
import { ContractCondition, ContractPredicate, ContractSettings } from './types';

export default abstract class Contract {
  public static setSettings (settings: ContractSettings) {
    ContractInternal._setSettings(settings);
  }

  public static OldValue<T> (value: T): T {
    return value;
  }

  public static OldValueByPath<T> (path: string): T {
    return {} as T;
  }

  public static ContractResult () {
    return {};
  }

  /**
   * Not a Decorator. Specifies a condition to test. Executes at the place of call.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  public static Assert<T extends Error> (condition: ContractCondition, message?: string) {
    return function (...args: any[]) {
      if (ContractInternal.shouldSkipContractChecks) return;
      ContractInternal._assert<T>(condition.apply(this, args), message);
    };
  }

  public static Exists<T, E extends Error> (collection: T[], predicate: ContractPredicate<T>, message?: string): void {
    if (ContractInternal.shouldSkipContractChecks) return;
    ContractInternal._exists<T, E>(collection, predicate, message);
  }

  public static ForAll<T, E extends Error> (collection: T[], predicate: ContractPredicate<T>, message?: string): void {
    if (ContractInternal.shouldSkipContractChecks) return;
    ContractInternal._forAll<T, E>(collection, predicate, message);
  }

  public static Requires<T extends Error> (condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;

      if (ContractInternal.shouldSkipContractChecks) return descriptor;

      const descriptorCall = function (...args: any[]) {
        ContractInternal._requires<T>(condition.apply(null, [...args, this]), message);
        return original.apply(this, args);
      };

      descriptor.value = descriptorCall;

      return descriptor;
    };
  }

  /**
   * Specifies a postcondition contract for the enclosing method or property.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  public static Ensures<T extends Error> (condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;

      if (ContractInternal.shouldSkipContractChecks) return descriptor;

      const { bindOldValue, bindOldValueByPath, bindFunctionResult, hasOldValueParameter, populateCache, populateResultCache, destroyCache } = ContractInternal.initContextParameters(Contract, condition, target, key);
      const descriptorCall = function (...args: any[]) {
        bindOldValue();
        bindOldValueByPath(this);
        bindFunctionResult();

        if (hasOldValueParameter) {
          populateCache(...args, this);
        }

        const result = original.apply(this, args);
        populateResultCache(result);

        const trace = `Class: ${target.constructor.name}, Function: ${key.toString()}. ${message}`;
        ContractInternal._ensures<T>(condition.apply(null, [...args, this]), trace);
        destroyCache();

        return result;
      };
      descriptor.value = descriptorCall;

      return descriptor;
    };
  }
}
