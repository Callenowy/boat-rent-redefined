import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import loading from '@salesforce/label/c.common_loading';
import findBoatTitle from '@salesforce/label/c.boat_search_card_title';
import newBoat from '@salesforce/label/c.boat_new_boat';
import createNewBoat from '@salesforce/label/c.boat_new_boat_create';

const i18n = {
  loading,
  findBoatTitle,
  newBoat,
  createNewBoat
};

export default class BoatSearch extends NavigationMixin(LightningElement) {
  isLoading = false;

  get i18n() {
    return i18n;
  }

  handleLoading() {
    this.isLoading = true;
  }

  handleDoneLoading() {
    this.isLoading = false;
  }

  searchBoats(event) {
    const { boatTypeId } = event.detail;
    this.template
      .querySelector('c-boat-search-results')
      .searchBoats(boatTypeId);
  }

  createNewBoat() {
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
        objectApiName: 'Boat__c',
        actionName: 'new'
      }
    });
  }
}
