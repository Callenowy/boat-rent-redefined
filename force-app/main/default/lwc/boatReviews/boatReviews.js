import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import loading from '@salesforce/label/c.common_loading';
import noReviews from '@salesforce/label/c.boat_no_reviews';

const i18n = {
  loading,
  noReviews
};

export default class BoatReviews extends NavigationMixin(LightningElement) {
  boatId;
  error;
  isLoading;
  @track boatReviews;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
    this.getReviews();
  }

  get reviewsToShow() {
    return this.boatReviews && this.boatReviews.length > 0;
  }

  get i18n() {
    return i18n;
  }

  @api
  refresh() {
    this.getReviews();
  }

  async getReviews() {
    this.isLoading = true;

    try {
      this.boatReviews = await getAllReviews({ boatId: this.boatId });
    } catch (error) {
      this.boatReviews = undefined;
      this.error = error;
    } finally {
      this.isLoading = false;
    }
  }

  navigateToRecord(event) {
    const recordId = event.target.dataset.recordId;
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: recordId,
        objectApiName: 'User',
        actionName: 'view'
      }
    });
  }
}
