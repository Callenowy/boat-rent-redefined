import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { publish, MessageContext } from 'lightning/messageService';
import BoatMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { refreshApex } from '@salesforce/apex';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';

import SUCCESS_TITLE from '@salesforce/label/c.common_success';
import ERROR_TITLE from '@salesforce/label/c.common_error';
import NAME_LABEL from '@salesforce/label/c.common_name';
import LENGTH_LABEL from '@salesforce/label/c.common_length';
import PRICE_LABEL from '@salesforce/label/c.common_price';
import DESCRIPTION_LABEL from '@salesforce/label/c.common_description';
import MESSAGE_SHIP_IT from '@salesforce/label/c.boat_ship_it';
import galleryTab from '@salesforce/label/c.boat_gallery_tab';
import boatEditorTab from '@salesforce/label/c.boat_editor_tab';
import nearMeTab from '@salesforce/label/c.boat_near_tab';

const i18n = {
  galleryTab,
  boatEditorTab,
  nearMeTab
};

const SUCCESS_VARIANT = 'success';
const ERROR_VARIANT = 'error';

const COLUMNS = [
  { label: NAME_LABEL, fieldName: 'Name', type: 'text', editable: 'true' },
  {
    label: LENGTH_LABEL,
    fieldName: 'Length__c',
    type: 'number',
    editable: 'true'
  },
  {
    label: PRICE_LABEL,
    fieldName: 'Price__c',
    type: 'currency',
    editable: 'true'
  },
  {
    label: DESCRIPTION_LABEL,
    fieldName: 'Description__c',
    type: 'text',
    editable: 'true'
  }
];

export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = COLUMNS;
  boatTypeId = '';
  isLoading = false;

  @track boats = [];

  @wire(MessageContext)
  messageContext;

  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats({ data, error }) {
    if (data) {
      this.boats = data;
    } else if (error) {
      this.error = error;
    }

    this.notifyLoading(false);
  }

  @api
  searchBoats(boatTypeId) {
    this.notifyLoading(true);
    this.boatTypeId = boatTypeId;
  }

  @api
  async refresh() {
    this.notifyLoading(true);
    await refreshApex(this.boats);
    this.notifyLoading(false);
  }

  get i18n() {
    return i18n;
  }

  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }

  sendMessageService(boatId) {
    publish(this.messageContext, BoatMC, { recordId: boatId });
  }

  // eslint-disable-next-line consistent-return
  async handleSave(event) {
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;

    try {
      await updateBoatList({ data: updatedFields });
      this.dispatchToast(SUCCESS_TITLE, MESSAGE_SHIP_IT);

      return this.refresh();
    } catch (error) {
      this.error = error;
      this.dispatchToast(ERROR_TITLE, error, ERROR_VARIANT);
    } finally {
      event.detail.draftValues = [];
      this.notifyLoading(false);
    }
  }

  notifyLoading(isLoading) {
    const loadingEvt = new CustomEvent(isLoading ? 'loading' : 'doneloading');
    this.dispatchEvent(loadingEvt);
  }

  dispatchToast(title, message, variant = SUCCESS_VARIANT) {
    this.dispatchEvent(
      new ShowToastEvent({
        title,
        message,
        variant
      })
    );
  }
}
