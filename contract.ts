import ContractInternal from "./contract-internal";

declare type ContractCondition = (...args: any[]) => boolean;
declare type ContractFunction = (check: boolean, message?: string) => boolean;
declare type DescriptorFunc = (originalFunction: any, contractCondition: ContractCondition, contractFunction: ContractFunction, message?: string) => any;

export default class Contract {
  /**
   * Specifies a postcondition contract for the enclosing method or property.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
   static Ensures (condition: (...conditionArgs: any[]) => boolean, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      descriptor.value = function(...args: any[]) {
        const result = original.apply(this, args);
        ContractInternal._ensures(condition.apply(null, result), message);
      }
  
      return descriptor;
    }
  }

  static Assume (condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      descriptor.value = function(...args: any[]) {
        const test = ContractInternal._assume(condition.apply(null, args), message);
        if (!test) {
          throw new Error(message);
        }

        const result = original.apply(this, args);
        return result;
      }
  
      return descriptor;
    }
  }
}