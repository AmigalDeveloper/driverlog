export class LogEntry {

  logEntryDetail!: {
    date: Date;
    distanceStart: number;
    distanceEnd: number;
    description: string;
    fuel: boolean;
  };

  fuelEntryDetail!: {
    amount: number;
    amountUnit: string;
    priceUnit: number;
    distance: number;
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
    });
    this.setFuelEntryDetail({
      amount: 0,
      amountUnit: 'liter',
      priceUnit: 0,
      distance: 0,
    });
    console.log(
      'constructor input',
      'date:',
      date,
      'distanceStart:',
      distanceStart,
      'distanceEnd:',
      distanceEnd,
      'description:',
      description,
      'fuel:',
      fuel,
      'amount:',
      amount,
      'amountUnit:',
      amountUnit,
      'priceUnit:',
      priceUnit,
      'distance:',
      distance
    );

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
  }) {
    this.logEntryDetail = value;
  }

  setFuelEntryDetail(value: {
    amount: number;
    amountUnit: string;
    priceUnit: number;
    distance: number;
  }) {
    this.fuelEntryDetail = value;
  }
}
