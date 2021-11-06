import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import BOAT_OBJECT from '@salesforce/schema/Boat__c';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import RELATED_TITLE from '@salesforce/label/c.boat_related_title';
import NOT_FOUND from '@salesforce/label/c.boat_related_not_found';

export default class SimilarBoats extends NavigationMixin(LightningElement) {
  relatedBoats;
  boatId;
  error;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  @api similarBy;

  @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
  similarBoats({ error, data }) {
    if (data) {
      this.relatedBoats = data;
      this.error = undefined;
    } else if (error) {
      this.relatedBoats = undefined;
      this.error = error;
    }
  }

  get getTitle() {
    return `${RELATED_TITLE} ${this.similarBy}`;
  }

  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  get noSimilarBoatsFound() {
    return `${NOT_FOUND} ${this.similarBy}!`;
  }

  openBoatDetailPage(event) {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: event.detail.boatId,
        objectApiName: BOAT_OBJECT,
        actionName: 'view'
      }
    });
  }
}
