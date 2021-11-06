import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import {
  subscribe,
  unsubscribe,
  MessageContext,
  APPLICATION_SCOPE
} from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import currentLocation from '@salesforce/label/c.boat_current_location';
import selectLocation from '@salesforce/label/c.boat_select_location';

const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

const i18n = {
  currentLocation,
  selectLocation
};

export default class BoatMap extends LightningElement {
  subscription = null;
  error = undefined;
  boatId;

  @track mapMarkers = [];

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
  }

  @wire(MessageContext) messageContext;

  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
    } else if (error) {
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  subscribeMC() {
    if (this.subscription || this.recordId) {
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

  updateMap(Longitude, Latitude) {
    this.mapMarkers = [
      {
        location: {
          Latitude,
          Longitude
        }
      }
    ];
  }

  get showMap() {
    return this.mapMarkers.length > 0;
  }

  get i18n() {
    return i18n;
  }
}
