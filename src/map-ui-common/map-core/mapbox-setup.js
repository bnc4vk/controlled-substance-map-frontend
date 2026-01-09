export function configureMapboxAccessToken({
  localToken,
  prodToken,
  isLocalhost = window.location.hostname === "localhost",
} = {}) {
  const token = isLocalhost ? localToken : prodToken;
  if (!token) {
    throw new Error("Mapbox access token is required.");
  }
  mapboxgl.accessToken = token;
  return token;
}

export function getMapboxViewportConfig({
  mobileBreakpoint = 500,
  mobileCenter = [-40, 20],
  desktopCenter = [10, 20],
  mobileZoom = 0.8,
  desktopZoom = 1.3,
} = {}) {
  const isMobile = window.innerWidth <= mobileBreakpoint;

  return {
    isMobile,
    center: isMobile ? mobileCenter : desktopCenter,
    zoom: isMobile ? mobileZoom : desktopZoom,
  };
}
