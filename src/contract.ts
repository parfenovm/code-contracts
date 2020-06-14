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

  /**
   * Represents values as they were at the start of a method or property.
   * @param value - value of type T
   */
  public static OldValue<T> (value: T): T {
    return value;
  }

  /**
   * Represents values as they were at the start of a method or property.
   * @param path - path to the value
   */
  public static OldValueByPath<T> (path: string): T {
    return {} as T;
  }

  /**
   * Represents the return value of a method or property.
   */
  public static ContractResult () {
    return {};
  }

  /**
   * Checks for a condition; if the condition is false, follows the escalation policy set for the analyzer.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  public static Assert (condition: ContractCondition, message?: string) {
    return function (...args: any[]) {
      if (ContractInternal.shouldSkipContractChecks) return;
      ContractInternal._assert(condition.apply(this, args), message);
    };
  }

  /**
   * Determines whether an element within a collection of elements exists within a function.
   * @param collection<T> - Collection of type T
   * @param predicate<T> - Predicate condition with return type T
   * @param message - The message to post if the assumption fails.
   */
  public static Exists<T> (collection: T[], predicate: ContractPredicate<T>, message?: string): void {
    if (ContractInternal.shouldSkipContractChecks) return;
    ContractInternal._exists<T>(collection, predicate, message);
  }

  /**
   * Determines whether all the elements in a collection exist within a function.
   * @param collection<T> - Collection of type T
   * @param predicate<T> - Predicate condition with return type T
   * @param message - The message to post if the assumption fails.
   */
  public static ForAll<T> (collection: T[], predicate: ContractPredicate<T>, message?: string): void {
    if (ContractInternal.shouldSkipContractChecks) return;
    ContractInternal._forAll<T>(collection, predicate, message);
  }

  /**
   * Specifies a precondition contract for the enclosing method or property, and displays a message if the condition for the contract fails.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  public static Requires (condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;

      if (ContractInternal.shouldSkipContractChecks) return descriptor;

      const descriptorCall = function (...args: any[]) {
        ContractInternal._requires(condition.apply(null, [...args, this]), message);
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
