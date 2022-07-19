import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ng-shuttle-reorder',
  templateUrl: './ng-shuttle-reorder.component.html',
  styleUrls: ['./ng-shuttle-reorder.component.scss']
})
export class NgShuttleReorderComponent implements OnInit, OnChanges {

  @Input() availableOptionsLabel!: string;
  @Input() availableOptions: { value: string, label: string }[] = [];

  @Input() selectedOptionsLabel!: string;
  @Input() selectedOptions: { value: string, label: string }[] = [];

  @Input() required: boolean = false;

  @Output() shuttleReorder = new EventEmitter();

  private compId: string = "";

  moveRightEnabled: boolean = false;
  moveLeftEnabled: boolean = false;
  moveUpEnabled: boolean = false;
  moveDownEnabled: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.compId = this.generateCompId();
  }

  private generateCompId() {
    return ("SR-" + ("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").sort(() => { return Math.random() - Math.random(); }).join("").substring(0, 11)));
  }

  ngOnChanges() {
    this.compId = this.generateCompId();
    this.updateSelectionStatus();
    setTimeout(() => {
      let availableListSelector = this.getAvailableListSelector();
      let selectedListSelector = this.getSelectedListSelector();
      availableListSelector && availableListSelector.scrollTo(0, 0);
      selectedListSelector && selectedListSelector.scrollTo(0, 0);
    }, 0);
  }

  getCompId(type: string) {
    return (type + '-') + this.compId;
  }

  shuttleReorderAction(actionType: string) {
    if (actionType === 'moveRight') {
      this.moveRight();
    } else if (actionType === 'moveLeft') {
      this.moveLeft();
    } else if (actionType === 'moveUp') {
      this.moveUp();
    } else if (actionType === 'moveDown') {
      this.moveDown();
    }
  }

  private getAvailableListSelector() {
    return document.getElementById("available-options-" + this.compId);
  }

  private getSelectedListSelector() {
    return document.getElementById("selected-options-" + this.compId);
  }

  private getSelectedOptionAndIndexFromAvailableList() {
    let selectorElement: any = this.getAvailableListSelector();
    let allOptions = selectorElement && selectorElement.querySelectorAll(".sr-option");
    let selectedOption = selectorElement && selectorElement.querySelector(".sr-option.selected");
    if (selectedOption) {
      return selectedOption ? { option: selectedOption, index: Array.prototype.indexOf.call(allOptions, selectedOption), allOptions: allOptions } : null;
    }
    return null;
  }

  private getSelectedOptionAndIndexFromSelectedList() {
    let selectorElement: any = this.getSelectedListSelector();
    let allOptions = selectorElement && selectorElement.querySelectorAll(".sr-option");
    let selectedOption = selectorElement && selectorElement.querySelector(".sr-option.selected");
    if (selectedOption) {
      return selectedOption ? { option: selectedOption, index: Array.prototype.indexOf.call(allOptions, selectedOption), allOptions: allOptions } : null;
    }
    return null;
  }

  doSelect(e: Event) {
    this.selectOption((<HTMLElement>e.currentTarget));
  }

  private selectOption(optionElement: HTMLElement) {
    optionElement.closest(".sr-selector")?.querySelectorAll(".selected").forEach((elem) => {
      elem.classList.remove("selected");
    });
    optionElement.classList.add("selected");
    this.updateSelectionStatus();
  }

  private scrollOptionIntoView(optionData: any) {
    if (optionData && optionData.option) {
      let selector = optionData.option.closest(".sr-selector");
      let allOptions = selector && selector.querySelectorAll(".sr-option");
      let index = Array.prototype.indexOf.call(allOptions, optionData.option);
      selector.scrollTo(0, optionData.option.offsetHeight * index - (optionData.option.offsetHeight * 2));
    }
  }

  private moveRight() {
    let optionData = this.getSelectedOptionAndIndexFromAvailableList();
    if (!this.moveRightEnabled || !optionData) {
      return;
    }
    let selector = this.getSelectedListSelector();
    if (selector) {
      selector.appendChild(optionData.option);
      this.selectOption(optionData.option);
      this.scrollOptionIntoView(optionData);
      this.actionComplete();
    }
  }

  private moveLeft() {
    let optionData = this.getSelectedOptionAndIndexFromSelectedList();
    if (!this.moveLeftEnabled || !optionData) {
      return;
    }
    let selector = this.getAvailableListSelector();
    if (selector) {
      selector.appendChild(optionData.option);
      this.selectOption(optionData.option);
      this.scrollOptionIntoView(optionData);
      this.actionComplete();
    }
  }

  private moveUp() {
    let optionData = this.getSelectedOptionAndIndexFromSelectedList();
    if (!this.moveUpEnabled || !optionData || optionData.index === 0) {
      return;
    }
    let selector = this.getSelectedListSelector();
    if (selector) {
      selector.insertBefore(optionData.option, optionData.allOptions[optionData.index - 1]);
      this.scrollOptionIntoView(optionData);
      this.actionComplete();
    }
  }

  private moveDown() {
    let optionData = this.getSelectedOptionAndIndexFromSelectedList();
    if (!this.moveDownEnabled || !optionData || optionData.index === optionData.allOptions.length - 1) {
      return;
    }
    let selector = this.getSelectedListSelector();
    if (selector) {
      selector.insertBefore(optionData.allOptions[optionData.index + 1], optionData.option);
      this.scrollOptionIntoView(optionData);
      this.actionComplete();
    }
  }

  updateSelectionStatus() {
    let availableListOptionData = this.getSelectedOptionAndIndexFromAvailableList();
    let selectedListOptionData = this.getSelectedOptionAndIndexFromSelectedList();
    let optionSelectedInAvailableList = !!availableListOptionData;
    let optionSelectedInSelectedList = !!selectedListOptionData;
    if (optionSelectedInAvailableList) {
      this.moveRightEnabled = true;
    } else {
      this.moveRightEnabled = false;
    }
    if (optionSelectedInSelectedList) {
      if (this.required) {
        if ((<any>selectedListOptionData)["allOptions"].length === 1) {
          this.moveLeftEnabled = false;
        } else {
          this.moveLeftEnabled = true;
        }
      } else {
        this.moveLeftEnabled = true;
      }
    } else {
      this.moveLeftEnabled = false;
    }
    if (optionSelectedInSelectedList) {
      if ((<any>selectedListOptionData)["index"] === 0) {
        this.moveUpEnabled = false;
      } else {
        this.moveUpEnabled = true;
      }
    } else {
      this.moveUpEnabled = false;
    }
    if (optionSelectedInSelectedList) {
      if ((<any>selectedListOptionData)["index"] === ((<any>selectedListOptionData)["allOptions"].length - 1)) {
        this.moveDownEnabled = false;
      } else {
        this.moveDownEnabled = true;
      }
    } else {
      this.moveDownEnabled = false;
    }
  }

  private getLatestListState() {
    let availableOptions: {}[] = [];
    let selectedOptions: {}[] = [];
    let availableListSelector = this.getAvailableListSelector();
    let selectedListSelector = this.getSelectedListSelector();
    if (availableListSelector) {
      availableListSelector.querySelectorAll(".sr-option").forEach((o: Element) => {
        availableOptions.push({
          value: o.getAttribute("data-value"),
          label: o.innerHTML
        });
      });
    }
    if (selectedListSelector) {
      selectedListSelector.querySelectorAll(".sr-option").forEach((o: Element) => {
        selectedOptions.push({
          value: o.getAttribute("data-value"),
          label: o.innerHTML
        });
      });
    }
    return {
      availableOptions: availableOptions,
      selectedOptions: selectedOptions
    };
  }

  private actionComplete() {
    this.updateSelectionStatus();
    this.shuttleReorder.emit(this.getLatestListState());
  }

}
