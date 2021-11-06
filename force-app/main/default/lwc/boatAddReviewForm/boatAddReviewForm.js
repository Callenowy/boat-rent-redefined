import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';
import rating from '@salesforce/label/c.common_rating';
import submit from '@salesforce/label/c.common_submit';
import REVIEW_CREATED from '@salesforce/label/c.boat_review_created';

const SUCCESS_VARIANT = 'success';

const i18n = {
  rating,
  submit
};

export default class BoatAddReviewForm extends LightningElement {
  boatId;
  rating;
  boatReviewObject = BOAT_REVIEW_OBJECT;
  nameField = NAME_FIELD;
  commentField = COMMENT_FIELD;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  get i18n() {
    return i18n;
  }

  handleRatingChanged(event) {
    this.rating = event.detail.rating;
  }

  handleSubmit(event) {
    event.preventDefault();
    const fields = event.detail.fields;
    fields.Boat__c = this.boatId;
    fields.Rating__c = this.rating;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }

  handleSuccess() {
    this.dispatchEvent(
      new ShowToastEvent({
        title: REVIEW_CREATED,
        variant: SUCCESS_VARIANT
      })
    );

    const createReviewEvent = new CustomEvent('createreview');
    this.dispatchEvent(createReviewEvent);
    this.handleReset();
  }

  handleReset() {
    const inputFields = this.template.querySelectorAll('lightning-input-field');
    if (inputFields) {
      inputFields.forEach(field => {
        field.reset();
      });
    }
  }
}
