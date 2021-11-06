import { LightningElement, api } from 'lwc';
import { loadStyle, loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fivestar from '@salesforce/resourceUrl/fivestar';
import ERROR_TITLE from '@salesforce/label/c.rating_error_loading';
import { classSet } from 'c/utils';

const ERROR_VARIANT = 'error';
const RATING_CLASS = 'c-rating';
const READ_ONLY_CLASS = 'readonly';

export default class FiveStarRating extends LightningElement {
  @api readOnly;
  @api value;

  editedValue;
  isRendered;

  get starClass() {
    return classSet(RATING_CLASS).add({
      [READ_ONLY_CLASS]: this.readOnly
    });
  }

  renderedCallback() {
    if (this.isRendered) {
      return;
    }
    this.loadScript();
    this.isRendered = true;
  }

  loadScript() {
    Promise.all([
      loadStyle(this, fivestar + '/rating.css'),
      loadScript(this, fivestar + '/rating.js')
    ])
      .then(() => {
        this.initializeRating();
      })
      .catch(error => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: ERROR_TITLE,
            message: error,
            variant: ERROR_VARIANT
          })
        );
      });
  }

  initializeRating() {
    const domEl = this.template.querySelector('ul');
    const maxRating = 5;

    const callback = rating => {
      this.editedValue = rating;
      this.ratingChanged(rating);
    };

    this.ratingObj = window.rating(
      domEl,
      this.value,
      maxRating,
      callback,
      this.readOnly
    );
  }

  ratingChanged(rating) {
    const ratingChangeEvent = new CustomEvent('ratingchange', {
      detail: { rating }
    });

    this.dispatchEvent(ratingChangeEvent);
  }
}
