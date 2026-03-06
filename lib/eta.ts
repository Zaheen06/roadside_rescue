/**
 * ETA Calculation Utility
 * Uses the Haversine formula to get distance, then estimates arrival time
 * assuming an average urban speed of 30 km/h.
 */

const EARTH_RADIUS_KM = 6371;
const AVG_SPEED_KMH = 30;

export function haversineDistanceKm(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface ETAResult {
    distanceKm: number;
    etaMinutes: number;
    etaText: string;
}

export function calculateETA(
    userLat: number, userLon: number,
    techLat: number, techLon: number
): ETAResult {
    const distanceKm = haversineDistanceKm(userLat, userLon, techLat, techLon);
    const etaMinutes = Math.ceil((distanceKm / AVG_SPEED_KMH) * 60);

    let etaText: string;
    if (etaMinutes <= 1) {
        etaText = "Arriving now";
    } else if (etaMinutes < 60) {
        etaText = `~${etaMinutes} min`;
    } else {
        const hours = Math.floor(etaMinutes / 60);
        const mins = etaMinutes % 60;
        etaText = `~${hours}h ${mins}m`;
    }

    return {
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        etaMinutes,
        etaText,
    };
}
