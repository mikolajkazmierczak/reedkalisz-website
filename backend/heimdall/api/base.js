export class Api {
  constructor() {
    if (this.constructor == Api) {
      throw new Error("Abstract class 'Api' can't be instantiated.");
    }
  }
  async fetch() {
    throw new Error("Method 'fetch()' must be implemented.");
  }
}
