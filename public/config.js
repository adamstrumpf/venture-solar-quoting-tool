// Runtime configuration. In production this file is regenerated on container
// start from the GOOGLE_MAPS_API_KEY environment variable (see docker-entrypoint.sh),
// so the key can be changed without rebuilding. Empty key = address autocomplete
// is disabled and the field behaves as a plain text input.
window.APP_CONFIG = { googleMapsApiKey: "" };
