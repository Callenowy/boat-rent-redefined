import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import {
  subscribe,
  unsubscribe,
  MessageContext,
  APPLICATION_SCOPE
} from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import details from '@salesforce/label/c.Details';
import reviews from '@salesforce/label/c.Reviews';
import addReview from '@salesforce/label/c.Add_Review';
import fullDetails from '@salesforce/label/c.Full_Details';
import selectABoat from '@salesforce/label/c.Please_select_a_boat';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];

const i18n = {
  addReview,
  details,
  fullDetails,
  selectABoat,
  reviews
};

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;

  @wire(MessageContext) messageContext;

  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord;

  get detailsTabIconName() {
    return this.wiredRecord && this.wiredRecord.data ? 'utility:anchor' : null;
  }

  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  get i18n() {
    return i18n;
  }

  subscription = null;

  subscribeMC() {
    if (this.subscription) {
      return;
    }

    if (!this.subscription) {
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        message => {
          this.boatId = message.recordId;
        },
        { scope: APPLICATION_SCOPE }
      );
    }
  }

  unsubscribeMC() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  connectedCallback() {
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeMC();
  }

  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.boatId,
        actionName: 'view'
      }
    });
  }

  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
    this.template.querySelector('c-boat-reviews').refresh();
  }
}
