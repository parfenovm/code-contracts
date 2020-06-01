export declare type ContractCondition = (...args: any[]) => boolean;
export declare type ContractPredicate<T> = (element: T) => boolean;
export declare type ContractSettings = {
  shouldFailOnCondition: boolean;
  shouldSkipContractChecks: boolean
};
