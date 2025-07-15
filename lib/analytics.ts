

import { AnalyticsEventInsert } from '../types';

/**
 * Tracks an analytics event by sending it to a secure serverless function.
 * This is a "fire-and-forget" function, meaning it won't block
 * the UI thread. Errors are logged to the console without being
 * thrown, to avoid crashing the user experience for an analytics event.
 *
 * @param eventType - A descriptive name for the event (e.g., 'view_vehicle').
 * @param vehicleId - The ID of the vehicle related to the event, if any.
 */
export const trackEvent = (eventType: string, vehicleId?: number): void => {
    const eventData: AnalyticsEventInsert = {
        event_type: eventType,
    };
    if (vehicleId !== undefined) {
        eventData.vehicle_id = vehicleId;
    }

    // Send the event to our secure API endpoint instead of directly to Supabase
    fetch('/api/analytics', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
        keepalive: true, // Useful for events fired during page unload
    }).catch(error => {
        // We still don't want to break the user experience for an analytics error
        console.error('Analytics Fetch Error:', error);
    });
};
