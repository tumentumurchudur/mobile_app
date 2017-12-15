import { IMeter, ILineItem } from "../interfaces";
import { convertConfigs, meterConfigs } from "../configs";

import * as moment from "moment";

export class CostHelper {
	public static calculateCostFromDeltas(meter: IMeter, deltas: ILineItem[]): any {
		let totalDelta: number = 0;
		let totalCost: number = 0;

		for (const delta of deltas) {
			const { date, line1 } = delta;

			totalDelta += line1 > 0 ? line1 : 0;

			const rate = this._getRate(meter, date, totalDelta);

			if (line1 > 0) {
				if (meter._utilityType === meterConfigs.types.GAS) {
					totalCost += line1 / convertConfigs.ccfToDth * rate;
				} else if (meter._utilityType === meterConfigs.types.WATER) {
					totalCost += line1 / convertConfigs.galToCcf * rate;
				} else {
					totalCost += line1 * rate;
				}
			}
		}

		return {
			totalCost: totalCost > 0 ? totalCost / 100 : 0,
			totalDelta
		};
	}

	private static _getRate(meter: IMeter, date: Date, delta: number): number {
		const { _winter, _summer } = meter;
		const isSummer = date >= _summer.start_date && date < _summer.end_date || false;
		const tiers = isSummer && _summer ? _summer.tiers : (_winter ? _winter.tiers : null);
		const rates = [];

		if (tiers) {
			for (let key of Object.keys(tiers)) {
				const limit = parseInt(key);
				const rate = tiers[key];

				rates.push({ limit, rate });

				if (delta > 0 && delta <= limit) {
					return rates[rates.length - 2].rate || rate;
				}
			}
			return rates[rates.length - 1].rate;
		}

		return 1;
	}

	public static calculateBillingCycles(billingStartDay: number): any {
		const today = new Date();
		const refDate = new Date(today.getFullYear(), today.getMonth(), billingStartDay);
		const prevBillingStartDate = moment(refDate).add(-1, "M").toDate();

		const billingStartDate = refDate < today ? refDate : prevBillingStartDate;
		const billingEndDate = refDate < today ? moment(refDate).add(1, "M").toDate() : moment(prevBillingStartDate).add(1, "M").toDate();

		// # of days for billing cycle.
		const billingTotalDays = moment.duration(moment(billingEndDate).diff(moment(billingStartDate))).asDays();

		// # of days since billing start date
		const billingCurrentDays = moment.duration(moment().diff(moment(billingStartDate))).asDays();

		return {
			billingTotalDays,
			billingCurrentDays
		};
	}

}
