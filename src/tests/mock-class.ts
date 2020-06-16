import Contract from '../contract';
import { ContractSettings } from '../types';
import Log from '../log';
import ContractFailedError from '../contract-error';

export default class Test {
  constructor (settings?: ContractSettings) {
    Contract.setSettings(settings || { shouldFailOnCondition: false, shouldSkipContractChecks: false, shouldLogError: false, defaultLogger: Log, defaultContractError: ContractFailedError });
  }
}
