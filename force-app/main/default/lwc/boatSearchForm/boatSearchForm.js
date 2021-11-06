import { LightningElement, track, wire } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';
import selectType from '@salesforce/label/c.boat_select_type';

const i18n = {
  selectType
};

export default class BoatSearchForm extends LightningElement {
  selectedBoatTypeId = '';
  @track searchOptions;

  @wire(getBoatTypes)
  boatTypes({ error, data }) {
    if (data) {
      this.searchOptions = data.map(({ Name, Id }) => ({
        label: Name,
        value: Id
      }));
      this.searchOptions.unshift({ label: 'All Types', value: '' });
    } else if (error) {
      this.searchOptions = undefined;
      this.error = error;
    }
  }

  get i18n() {
    return i18n;
  }

  handleSearchOptionChange(event) {
    this.selectedBoatTypeId = event.target.value;
    const searchEvent = new CustomEvent('search', {
      detail: {
        boatTypeId: this.selectedBoatTypeId
      }
    });

    this.dispatchEvent(searchEvent);
  }
}
