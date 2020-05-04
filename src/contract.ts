import "reflect-metadata";
import ContractInternal from "../contract-internal";

declare type ContractCondition = (...args: any[]) => boolean;
declare type ContractFunction = (check: boolean, message?: string) => boolean;
// declare type DescriptorFunc = (originalFunction: any, contractCondition: ContractCondition, contractFunction: ContractFunction, message?: string) => any;

const oldValueMetadataKey = Symbol('oldValue');


export default class Contract {
  private _postCondition = 'Ensures';
  private _preCondition = 'Requires'

  static OldValue<T> (value: T): T {
    console.log('this is a test')
    console.log(value);
    console.log(Reflect.getOwnMetadata("OldValue", Contract));
    return value;
  }


  // static OldValue (target: Object, propertyKey: string | symbol, parameterIndex: number) {
  //   console.log(propertyKey);
  //   let existingRequiredParameters: number[] = Reflect.getOwnMetadata(oldValueMetadataKey, target, propertyKey) || [];
  //   existingRequiredParameters.push(parameterIndex);
  //   Reflect.defineMetadata(oldValueMetadataKey, existingRequiredParameters, target, propertyKey);
  // }

  /**
   * Specifies a postcondition contract for the enclosing method or property.
   * @param condition - The conditional expression to test
   * @param message - The message to post if the assumption fails.
   */
  static Ensures(condition: (...conditionArgs: any[]) => boolean, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      descriptor.value = function (...args: any[]) {
        const cachedValues = [...args];
        const result = original.apply(this, args);
        ContractInternal._ensures(condition.apply(null, result), message);
      }

      return descriptor;
    }
  }

  static Assume(condition: ContractCondition, message?: string) {
    return (target: Object, key: string | symbol, descriptor: PropertyDescriptor) => {
      const original = descriptor.value;
      descriptor.value = function (...args: any[]) {
        ContractInternal._assume(condition.apply(null, args), message);
        const result = original.apply(this, args);
        return result;
      }

      return descriptor;
    }
  }
}