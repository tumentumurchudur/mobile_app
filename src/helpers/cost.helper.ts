import { Injectable } from "@angular/core";
import { IMeter } from '../interfaces';
import { convertConfigs } from "../configs";

@Injectable()
export class CostHelper {
	/**
	 * Adds up daily usage number from _reads array.
	 *
	 * Example: { _reads: { date: 10/1/17 , total: 8425 }, { date: 10/2/17, total: 8449 }}
	 * the usage is 8449 - 8425 = 24 between 10/1 and 10/2.
	 *
	 * @param {IMeter[]} meters
	 * @returns
	 * @memberof CostHelper
	 */
	public calcUsageDiffs(meters: IMeter[]) {
		// Calculates consumption data from meter._reads array.
		meters.forEach(meter => {
			const reads = meter._reads;
			const calcData = [];

			for(let i = reads.length - 1; i >= 0; i--) {
				if (i - 1 >= 0) {
					const diff = reads[i].total - reads[i-1].total;

					calcData.push(diff);
				}
			}
			meter._usage = calcData.length ? calcData.reduce((a,b) => a + b) : 0;
		});

		return meters;
	}

	/**
	 * Calculates the actual cost from usage number.
	 *
	 * @param {IMeter[]} meters
	 * @returns
	 * @memberof CostHelper
	 */
	public calcUsageCost(meters: IMeter[]) {
		for(let i = 0; i <= meters.length - 1; i++) {
			const today = new Date();
			const summer = meters[i]._summer;
			const winter = meters[i]._winter;
			const startDate = summer ? new Date(summer.start_date + "/" + today.getFullYear()) : null;
			const endDate = summer ? new Date(summer.end_date + "/" + today.getFullYear()) : null;
			const isSummer = startDate && endDate ? today >= startDate && today < endDate : false;
			const tiers = isSummer && summer ? summer.tiers : (winter ? winter.tiers : null);
			let usage = 0;

			// Finds # of days it has been since billing start date.
			const refDate = new Date(today.getFullYear(), today.getMonth(), meters[i]._billing_start);
			const prevBillingStartDate = new Date(today.getFullYear(), today.getMonth() - 1, meters[i]._billing_start);
			const billingStartDate = refDate < today ? refDate : prevBillingStartDate;

			// # of days since billing start date
			meters[i]._billing_since_start = this._findDiffDays(billingStartDate, today);
			// # of days in billing cycle.
			meters[i]._billing_total = this._findDiffDays(prevBillingStartDate, refDate);
			//-------------------------------------------------------------

			const utilityType = meters[i]._utilityType;

			if (utilityType === "gas") {
				usage = meters[i]._usage / convertConfigs.ccfToDth;
			} else if (utilityType === "water") {
				usage = meters[i]._usage / convertConfigs.galToCcf;
			} else {
				usage = meters[i]._usage;
			}

			meters[i]._actualUsageCost = 0;

			if (tiers) {
				const rate = [];
				let curr = 0;
				let next = 1;
				let total = 0;

				for (let key of Object.keys(tiers)) {
					rate.push({
						tier: key,
						rate: tiers[key]
					});
				}

				while(next <= rate.length-1) {
					if(usage >= rate[next].tier) {
						total += (rate[next].tier - rate[curr].tier) * rate[curr].rate
					} else if(usage < rate[next].tier) {
						total += (usage - rate[curr].tier) * rate[curr].rate
						break
					}
					if(next === rate.length - 1 && usage > rate[next].tier) {
						total += (usage - rate[next].tier) * rate[next].rate
					}
					curr++
					next++
				}
				meters[i]._actualUsageCost = total > 0 ? total / 100 : 0; // + meters[i]._facilityFee;
			}
		}
		return meters;
	}

	/**
	 * Finds # of days between start and end dates.
	 *
	 * @private
	 * @param {Date} startDate
	 * @param {Date} endDate
	 * @returns {number}
	 * @memberof CostHelper
	 */
	private _findDiffDays(startDate: Date, endDate: Date): number {
		const timeDiff = Math.abs(startDate.getTime() - endDate.getTime());

		return Math.floor(timeDiff / (1000 * 3600 * 24));
	}

}
