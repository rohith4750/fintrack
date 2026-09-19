import { Linking, Platform, Alert } from 'react-native';
import * as Location from 'expo-location';

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
}

/**
 * Capture high-accuracy GPS coordinates using device GPS
 */
export async function getCurrentGpsPosition(): Promise<GeoCoordinate> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied. Please grant location access in device settings.');
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    let addressStr = '';
    try {
      const reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        const r = reverse[0];
        addressStr = [r.name, r.street, r.district, r.city, r.region, r.postalCode]
          .filter(Boolean)
          .join(', ');
      }
    } catch (revErr) {
      console.log('Reverse geocode note:', revErr);
    }

    return {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      accuracy: loc.coords.accuracy || undefined,
      address: addressStr || undefined,
    };
  } catch (error: any) {
    console.warn('GPS position error:', error);
    throw error;
  }
}

/**
 * Open Google Maps turn-by-turn navigation for a customer's location
 */
export async function openGoogleMapsNavigation(
  latitude?: number,
  longitude?: number,
  customerName?: string,
  address?: string
): Promise<void> {
  const label = customerName ? encodeURIComponent(customerName) : 'Customer Location';

  // 1. If exact GPS Lat/Lng available
  if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
    const googleMapsAppUrl = Platform.select({
      ios: `comgooglemaps://?q=${latitude},${longitude}&zoom=16`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });

    const webNavigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=&travelmode=driving`;

    try {
      if (googleMapsAppUrl && (await Linking.canOpenURL(googleMapsAppUrl))) {
        await Linking.openURL(googleMapsAppUrl);
        return;
      }
    } catch (e) {
      console.log('Native map app launch fallback to browser');
    }

    // Fallback to web google maps navigation
    await Linking.openURL(webNavigationUrl);
    return;
  }

  // 2. If only text address is available
  if (address && address.trim()) {
    const query = encodeURIComponent(`${address.trim()}`);
    const searchUrl = Platform.select({
      ios: `maps://?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });

    try {
      if (searchUrl && (await Linking.canOpenURL(searchUrl))) {
        await Linking.openURL(searchUrl);
        return;
      }
    } catch (e) {}

    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    return;
  }

  Alert.alert('No Location', 'No GPS coordinates or address recorded for this customer.');
}
