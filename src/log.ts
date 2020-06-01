export default class Log {
  static log (message?: string) {
    if (message) {
      console.log(message);
    }
  }

  static debug (message: string) {
    console.debug(message);
  }
}
