/**
 * Zoom Service (Backend Simulation)
 * 
 * In production, this would make an HTTP request to:
 * POST /api/meetings/zoom
 * 
 * The Node.js/Express backend would then interact with the Zoom API
 * to create a meeting, generating URLs and passcodes.
 */

export const createZoomMeeting = async (meetingData) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('[BACKEND SIMULATION] POST /api/meetings/zoom', meetingData);

  // Generate mock Zoom data
  const meetingId = Math.floor(10000000000 + Math.random() * 90000000000).toString(); // 11 digit meeting ID
  const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return {
    success: true,
    data: {
      provider: 'Zoom',
      meetingId: meetingId,
      joinUrl: `https://zoom.us/j/${meetingId}?pwd=${passcode}`,
      hostUrl: `https://zoom.us/s/${meetingId}`,
      passcode: passcode,
      organizer: 'Nexus HR (you)'
    }
  };
};
