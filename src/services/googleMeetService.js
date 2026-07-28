/**
 * Google Meet Service (Backend Simulation)
 * 
 * In production, this would make an HTTP request to:
 * POST /api/meetings/google
 * 
 * The Node.js/Express backend would then interact with the Google Calendar API
 * to create an event and generate a Meet link.
 */

export const createGoogleMeeting = async (meetingData) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log('[BACKEND SIMULATION] POST /api/meetings/google', meetingData);

  // Generate mock Google Meet data
  const meetingId = Math.random().toString(36).substring(2, 12).match(/.{1,3}/g).join('-');
  
  return {
    success: true,
    data: {
      provider: 'Google Meet',
      meetingId: meetingId,
      joinUrl: `https://meet.google.com/${meetingId}`,
      calendarEventId: `evt_${Date.now()}`,
      organizer: 'Nexus HR (you)'
    }
  };
};
