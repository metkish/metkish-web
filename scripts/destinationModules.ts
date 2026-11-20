// Shared list of destination journey-data modules — every place that
// needs to walk "every Journey in every destination" (the route
// validator, the build-time route-cache generator) imports this instead
// of keeping its own copy, so a new destination only ever needs to be
// added here once.
export const DESTINATION_MODULES = [
  '../lib/journeys/tenerife',
  '../lib/journeys/italy',
  '../lib/journeys/barcelona',
  '../lib/journeys/rome',
  '../lib/journeys/iceland',
  '../lib/journeys/sardinia',
];
