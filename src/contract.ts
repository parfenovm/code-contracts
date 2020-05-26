import 'reflect-metadata';
import ContractInternal from './contract-internal';
import _set from 'lodash.set';
import _get from 'lodash.get';
import _clone from 'lodash.clone';
import Log from './log';
import { ContractCondition } from './types';

export default abstract class Contract {
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
  public static Assert (condition: ContractCondition, message?: string) {
    return function (...args: any[]) {
      ContractInternal._assert(condition.apply(this, args), message);
    };
  }

  /**
   * Specifies a postcondition contract for the enclosing method or property.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  public static Ensures (condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;

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
        ContractInternal._ensures(condition.apply(null, [...args, this]), message);
        destroyCache();
      };
      descriptor.value = descriptorCall;

      return descriptor;
    };
  }
}
