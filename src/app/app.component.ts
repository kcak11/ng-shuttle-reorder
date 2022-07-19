import { Component } from '@angular/core';

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
    for (var i = 1; i <= 10; i++) {
      availableOptions.push({ value: "op" + i, label: "Option " + i });
    }
    this.availableOptions = availableOptions;

    let selectedOptions = <any>[];
    for (var i = 11; i <= 20; i++) {
      selectedOptions.push({ value: "op" + i, label: "Option " + i });
    }
    this.selectedOptions = selectedOptions;
  }

  handleShuttleReorder(value: any) {
    /* Do whatever with the value */
    console.log(value);
  }

}
