export class LogEntry {

  logEntryDetail!: {
    date: Date;
    distanceStart: number;
    distanceEnd: number;
    description: string;
    fuel: boolean;
    timestamp: any
    id?: any;
  };

  fuelEntryDetail!: {
    amount: number;
    amountUnit: string;
    priceUnit: number;
    distance: number;
    timestamp:any;
    id?: any;
  };

  constructor(
    date?: Date,
    distanceStart?: number,
    distanceEnd?: number,
    description?: string,
    fuel?: boolean,
    amount?: number,
    amountUnit?: string,
    priceUnit?: number,
    distance?: number
  ) {
    this.setLogEntryDetail({
      date: new Date(),
      distanceStart: 0,
      distanceEnd: 0,
      description: ' start',
      fuel: true,
      timestamp: new Date().toISOString(),
    });
    this.setFuelEntryDetail({
      amount: 0,
      amountUnit: 'liter',
      priceUnit: 0,
      distance: 0,
      timestamp: new Date().toISOString()
    });

    if (date) {
      this.logEntryDetail.date = date;
    }
    if (distanceStart) {
      this.logEntryDetail.distanceStart = distanceStart;
    }
    if (distanceEnd) {
      this.logEntryDetail.distanceEnd = distanceEnd;
    }
    if (description) {
      this.logEntryDetail.description = description;
    }
    if (fuel) {
      this.logEntryDetail.fuel = fuel;
    }
    if (amount) {
      this.fuelEntryDetail.amount = amount;
    }
    if (amountUnit) {
      this.fuelEntryDetail.amountUnit = amountUnit;
    }
    if (priceUnit) {
      this.fuelEntryDetail.priceUnit = priceUnit;
    }
    if (distance) {
      this.fuelEntryDetail.distance = distance;
    }
  }

  get LogEntryDetail() {
    return this.logEntryDetail;
  }

  get FuelEntryDetail() {
    return this.fuelEntryDetail;
  }

  setLogEntryDetail(value: {
    date: Date;
    distanceStart: number;
    distanceEnd: number;
    description: string;
    fuel: boolean;
    timestamp: any;
    id?;
  }) {
    this.logEntryDetail = value;
  }

  setFuelEntryDetail(value: {
    amount: number;
    amountUnit: string;
    priceUnit: number;
    distance: number;
    timestamp: any;
    id?;
  }) {
    this.fuelEntryDetail = value;
  }
}
