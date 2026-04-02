let currentLiveCreationSession = null;

export function setLiveCreationSession(session) {
  currentLiveCreationSession = session || null;
}

export function getLiveCreationSession(videoId = null) {
  if (!currentLiveCreationSession) return null;
  if (videoId === null || videoId === undefined) return currentLiveCreationSession;

  return `${currentLiveCreationSession.videoId}` === `${videoId}` ? currentLiveCreationSession : null;
}

export function clearLiveCreationSession(videoId = null) {
  if (!currentLiveCreationSession) return;
  if (videoId !== null && videoId !== undefined && `${currentLiveCreationSession.videoId}` !== `${videoId}`) return;

  currentLiveCreationSession = null;
}