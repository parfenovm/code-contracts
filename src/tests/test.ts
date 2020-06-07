import Contract from '../contract';

export default class Test {
  constructor () {
    Contract.setSettings({ shouldFailOnCondition: false, shouldSkipContractChecks: false });
  }
}
