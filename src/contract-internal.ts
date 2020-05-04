import Log from "../log";

export default class ContractInternal {
    /**
   * @param condition - The conditional expression to assume true.
   * @param message - The message to post if the assumption fails.
   */
   static assert (condition: boolean, message?: string) {
    if (!condition) {
      if (message) {
        Log.log(message);
      }
    }

    return condition;
  }

  /**
   * Same as the assert but not removed during compilation faze
   * and used in runtime.
   * @param condition - The conditional expression to assume true.
   * @param message - The message to post if the assumption fails.
   */
  static _assume (condition: boolean, message?: string) {
    if (!condition) {
      if (message) {
        Log.log(message);
      }
    }

    return condition;
  }

  static _ensures (condition: boolean, message?: string) {
    console.log(condition)
    if (!condition) {
      if (message) {
        Log.log(message);
      }
    }

    return condition;
  }
}