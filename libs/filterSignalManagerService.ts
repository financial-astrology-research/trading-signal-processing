import { TradingViewStrategySignal } from "../types/signalTypes";
import { every, isEmpty } from "lodash";

/**
 * Filter manager is a service responsible of filter noise through filter rules functions.
 *
 * @class filterSignalService
 */
class filterSignalManagerService {
  filters: Array<Function>;
  constructor() {
    this.filters = [];
  }

  /**
   * Register a signal filter function.
   *
   * @param {function} filterFunction Register a filter function for filters check execution.
   * @returns {Void} None.
   * @memberof filterSignalService
   */
  register(filterFunction: Function) {
    this.filters.push(filterFunction);
  }

  /**
   * Execute registered signal filters.
   *
   * @param {TradingViewStrategySignal} signalData A TV trading signal.
   * @returns {boolean} TRUE when all filters passed, FALSE otherwise.
   * @memberof filterSignalService
   */
  checkFilters(signalData: TradingViewStrategySignal) {
    const filterResults: Array<boolean> = [];
    this.filters.forEach((filterFunction: Function) => {
      const filterResult = filterFunction(signalData);
      filterResults.push(filterResult);
    });

    return every(filterResults, !isEmpty);
  }
}

const filterSignalManager = new filterSignalManagerService();
Object.freeze(filterSignalManager);

export default filterSignalManager;
