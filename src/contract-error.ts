export default class ContractFailedError extends Error {
  constructor (message: string) {
    super(message);

    this.name = 'ContractFailedError';
    Object.setPrototypeOf(this, ContractFailedError.prototype);
  }
}
