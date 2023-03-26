export class ExternalAPI {
  constructor() {
    if (this.constructor == ExternalAPI) {
      throw new Error("Abstract class 'ExternalAPI' can't be instantiated.");
    }
  }
  async fetch() {
    throw new Error("Method 'fetch()' must be implemented.");
  }
}
