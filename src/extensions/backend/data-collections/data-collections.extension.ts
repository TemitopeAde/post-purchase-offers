import { extensions } from '@wix/astro/builders'

import campaignsCollection from './campaigns';

import offersCollection from './offers';

import offerEventsCollection from './offer-events';

import appSettingsCollection from './app-settings';

export default extensions.dataCollections({
  id: 'ed353f49-8d97-404c-ba7a-4b7280297e57',
  name: 'Data Collections',
  collections: [
    campaignsCollection,
    offersCollection,
    offerEventsCollection,
    appSettingsCollection
  ],
});
