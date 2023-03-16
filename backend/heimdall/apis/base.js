export class ExternalAPI {
  constructor() {
    if (this.constructor == ExternalAPI) {
      throw new Error("Abstract class 'ExternalAPI' can't be instantiated.");
    }
  }
  parse() {
    throw new Error("Method 'parse()' must be implemented.");
  }
  async fetch() {
    throw new Error("Method 'fetch()' must be implemented.");
  }
}
