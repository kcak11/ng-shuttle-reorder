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

  @Input() hideReorderControls: boolean = false;

  private debounce: any;
  private focussedSelector: any;

  private compId: string = "";

  moveRightEnabled: boolean = false;
  moveLeftEnabled: boolean = false;
  moveUpEnabled: boolean = false;
  moveDownEnabled: boolean = false;

  constructor() {
    this.handleShuttleInput = this.handleShuttleInput.bind(this);
    this.handleShuttleKeyboard = this.handleShuttleKeyboard.bind(this);
  }

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
      document.querySelectorAll(".sr-option").forEach((option) => {
        option.setAttribute("data-label", option.innerHTML.toLowerCase());
      });
      let shuttleInputAndKeyboardHandler = document.getElementById("shuttleInputAndKeyboardHandler-" + this.compId);
      shuttleInputAndKeyboardHandler && shuttleInputAndKeyboardHandler.addEventListener("input", this.handleShuttleInput, false);
      shuttleInputAndKeyboardHandler && shuttleInputAndKeyboardHandler.addEventListener("keydown", this.handleShuttleKeyboard, false);
    }, 0);
  }

  handleShuttleInput() {
    let shuttleInputAndKeyboardHandler = document.getElementById("shuttleInputAndKeyboardHandler-" + this.compId);
    if (!shuttleInputAndKeyboardHandler) {
      return;
    }
    let val = ((<any>shuttleInputAndKeyboardHandler)["value"] || "").toLowerCase();
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => {
      let option = document.querySelector(".sr-option[data-label^=\"" + val + "\"]");
      if (option) {
        let h = (<any>option)["offsetHeight"];
        let selector = option.closest(".sr-selector");
        let pos = 0;
        let brk = false;
        if (selector) {
          selector.querySelectorAll(".sr-option").forEach((op) => {
            if (brk) {
              return;
            }
            if (op !== option) {
              pos += h;
            } else {
              brk = true;
            }
          });
          selector.scrollTo(0, pos);
        }
        this.selectOption(<HTMLElement>option);
        ((<any>shuttleInputAndKeyboardHandler)["value"] = "");
      } else {
        ((<any>shuttleInputAndKeyboardHandler)["value"] = "");
      }
    }, 300);
  }

  handleShuttleKeyboard(e: any) {
    if (!e || !this.focussedSelector) {
      return;
    }
    let op = this.focussedSelector.querySelector(".sr-option");
    let h = (op || {})["offsetHeight"] || 0;
    if (e.key === "ArrowDown" || e.code === "ArrowDown") {
      this.focussedSelector.scrollTo(0, this.focussedSelector.scrollTop + h);
    } else if (e.key === "ArrowUp" || e.code === "ArrowUp") {
      this.focussedSelector.scrollTo(0, this.focussedSelector.scrollTop - h);
    }
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
    let shuttleInputAndKeyboardHandler = document.getElementById("shuttleInputAndKeyboardHandler-" + this.compId);
    shuttleInputAndKeyboardHandler && shuttleInputAndKeyboardHandler.focus();
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

  handleSelectorClick(e: Event) {
    let currentTarget: any = e.currentTarget;
    if (!currentTarget) {
      return;
    }
    let shuttleInputAndKeyboardHandler = document.getElementById("shuttleInputAndKeyboardHandler-" + this.compId);
    shuttleInputAndKeyboardHandler && shuttleInputAndKeyboardHandler.focus();
  }

  doSelect(e: Event) {
    let currentTarget: any = e.currentTarget;
    if (!currentTarget) {
      return;
    }
    let shuttleInputAndKeyboardHandler = document.getElementById("shuttleInputAndKeyboardHandler-" + this.compId);
    shuttleInputAndKeyboardHandler && shuttleInputAndKeyboardHandler.focus();
    this.selectOption((<HTMLElement>e.currentTarget));
    this.focussedSelector = currentTarget["closest"](".sr-selector");
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
