import { Component } from '@angular/core';
import { data } from './data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  availableOptions: { value: string, label: string }[] = [];
  selectedOptions: { value: string, label: string }[] = [];

  ngOnInit() {
    let availableOptions = <any>[];
    for (var i = 0; i < data.length; i++) {
      availableOptions.push({ value: data[i].countryCode, label: data[i]["name"] });
    }
    this.availableOptions = availableOptions;

    let selectedOptions = <any>[];
    this.selectedOptions = selectedOptions;
  }

  handleShuttleReorder(value: any) {
    /* Do whatever with the value */
    console.log(value);
  }

}
