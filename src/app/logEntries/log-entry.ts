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
  };

  constructor(date?, distanceStart?, distanceEnd?, description?, fuel?, amount?, amountUnit?, priceUnit?) {
    this.setLogEntryDetail({date: new Date(),distanceStart: 0, distanceEnd: 0,description: ' start', fuel: true});
    this.setFuelEntryDetail({amount:0,amountUnit: 'liter', priceUnit: 0});
    console.log(
      'constructor input',
      'date:',date,
      'distanceStart:', distanceStart,
      'distanceEnd:', distanceEnd,
      'description:', description,
      'fuel:', fuel,
      'amount:', amount,
      'amountUnit:', amountUnit,
      'priceUnit:', priceUnit
      );

    if(date) {this.logEntryDetail.date = date;}
    if(distanceStart) { this.logEntryDetail.distanceStart = distanceStart;}
    if(distanceEnd) { this.logEntryDetail.distanceEnd = distanceEnd;}
    if(description) { this.logEntryDetail.description = description;}
    if(fuel) { this.logEntryDetail.fuel = fuel;}
    if(amount) { this.fuelEntryDetail.amount = amount; }
    if(amountUnit) { this.fuelEntryDetail.amountUnit = amountUnit;}
    if(priceUnit) { this.fuelEntryDetail.priceUnit = priceUnit;}
  }

  getLogEntryDetail() {
    return this.logEntryDetail;
  }

  getFuelEntryDetail() {
    return this.fuelEntryDetail;
  }

  setLogEntryDetail(value){
    this.logEntryDetail = value;
  }

  setFuelEntryDetail(value){
    this.fuelEntryDetail = value;
  }

}
