import { LightningElement, wire, track, api } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import LABEL_YOU_ARE_HERE from '@salesforce/label/c.boat_you_are_here';
import ERROR_TITLE from '@salesforce/label/c.boat_error_loading_boats';
import footerLabel from '@salesforce/label/c.boat_near_footer';
import loading from '@salesforce/label/c.common_loading';

const ICON_STANDARD_USER = 'standard:user';
const ERROR_VARIANT = 'error';

const i18n = {
  footerLabel,
  loading
};

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  @track mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;

  @wire(getBoatsByLocation, {
    latitude: '$latitude',
    longitude: '$longitude',
    boatTypeId: '$boatTypeId'
  })
  wiredBoatsJSON({ error, data }) {
    if (data) {
      this.createMapMarkers(JSON.parse(data));
    } else if (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: ERROR_TITLE,
          message: error.body.message,
          variant: ERROR_VARIANT
        })
      );
      this.isLoading = false;
    }
  }

  renderedCallback() {
    if (this.isRendered) {
      return;
    }

    this.isRendered = true;
    this.getLocationFromBrowser();
  }

  getLocationFromBrowser() {
    navigator.geolocation.getCurrentPosition(
      position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      },
      error => {
        this.dispatchErrorToast(error);
      },
      {
        enableHighAccuracy: true
      }
    );
  }

  createMapMarkers(boatData) {
    const newMarkers = boatData.map(boat => ({
      location: {
        Latitude: boat.Geolocation__Latitude__s,
        Longitude: boat.Geolocation__Longitude__s
      },
      title: boat.Name
    }));

    newMarkers.unshift({
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      },
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER
    });

    this.mapMarkers = newMarkers;
    this.isLoading = false;
  }

  dispatchErrorToast(message) {
    this.dispatchEvent(
      new ShowToastEvent({
        ERROR_TITLE,
        message,
        ERROR_VARIANT
      })
    );
  }

  get i18n() {
    return i18n;
  }
}
