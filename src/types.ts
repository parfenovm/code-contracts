import Log from './log';
import ContractFailedError from './contract-error';

export declare type ContractCondition = (...args: any[]) => boolean;
export declare type ContractPredicate<T> = (element: T) => boolean;
export declare type ContractSettings = {
  shouldFailOnCondition: boolean;
  shouldSkipContractChecks: boolean,
  shouldLogError: boolean,
  defaultLogger: typeof Log,
  defaultContractError: typeof ContractFailedError
};
