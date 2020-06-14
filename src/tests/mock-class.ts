import Contract from '../contract';
import { ContractSettings } from '../types';

export default class Test {
  constructor (settings?: ContractSettings) {
    Contract.setSettings(settings || { shouldFailOnCondition: false, shouldSkipContractChecks: false, shouldLogError: false });
  }
}
