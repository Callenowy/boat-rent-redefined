import { LightningElement, api } from 'lwc';
import { classSet } from 'c/utils';

const TILE_WRAPPER_SELECTED_CLASS = 'selected';
const TILE_WRAPPER_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
  @api boat;
  @api selectedBoatId;

  get backgroundStyle() {
    return `background-image:url(${this.boat.Picture__c})`;
  }

  get tileClass() {
    return classSet(TILE_WRAPPER_CLASS).add({
      [TILE_WRAPPER_SELECTED_CLASS]: this.selectedBoatId === this.boat.Id
    });
  }

  selectBoat() {
    const boatSelectEvent = new CustomEvent('boatselect', {
      detail: {
        boatId: this.boat.Id
      }
    });

    this.dispatchEvent(boatSelectEvent);
  }
}
