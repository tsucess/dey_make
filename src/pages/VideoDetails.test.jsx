import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const hlsMockState = vi.hoisted(() => ({
  errorEvent: 'hlsError',
  isSupported: true,
  lastInstance: null,
}));

const authState = {
  isAuthenticated: true,
  user: { id: 99, fullName: 'Viewer Example', avatarUrl: '' },
};

vi.mock('../utils/loadHls', () => ({
  loadHls: vi.fn(async () => class MockHls {
    static Events = { ERROR: hlsMockState.errorEvent };

    static isSupported() {
      return hlsMockState.isSupported;
    }

    constructor() {
      this.handlers = {};
      this.loadSource = vi.fn();
      this.attachMedia = vi.fn();
      this.on = vi.fn((event, handler) => {
        this.handlers[event] = handler;
      });
      this.destroy = vi.fn();
      hlsMockState.lastInstance = this;
    }
  }),
}));
vi.mock('hls.js', () => ({
  default: class MockHls {
    static Events = { ERROR: hlsMockState.errorEvent };

    static isSupported() {
      return hlsMockState.isSupported;
    }

    constructor() {
      this.handlers = {};
      this.loadSource = vi.fn();
      this.attachMedia = vi.fn();
      this.on = vi.fn((event, handler) => {
        this.handlers[event] = handler;
      });
      this.destroy = vi.fn();
      hlsMockState.lastInstance = this;
    }
  },
}));

vi.mock('../utils/loadAgoraRtc', () => ({
  loadAgoraRtc: vi.fn(async () => ({
    createClient: vi.fn(() => ({
      remoteUsers: [],
      on: vi.fn(),
      join: vi.fn().mockResolvedValue('joined'),
      setClientRole: vi.fn().mockResolvedValue(undefined),
      publish: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
      removeAllListeners: vi.fn(),
    })),
    createMicrophoneAndCameraTracks: vi.fn(async () => []),
  })),
}));

vi.mock('../context/LanguageContext', async () => {
  const actual = await vi.importActual('../locales/translations');
  const t = actual.createTranslator('es');

  return {
    useLanguage: () => ({ locale: 'es', setLocale: vi.fn(), t }),
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState,
}));

let liveCreationSession = null;

vi.mock('../live/liveSessionStore', () => ({
  setLiveCreationSession: vi.fn((session) => {
    liveCreationSession = session || null;
  }),
  getLiveCreationSession: vi.fn((videoId = null) => {
    if (!liveCreationSession) return null;
    if (videoId === null || videoId === undefined) return liveCreationSession;
    return `${liveCreationSession.videoId}` === `${videoId}` ? liveCreationSession : null;
  }),
  clearLiveCreationSession: vi.fn((videoId = null) => {
    if (!liveCreationSession) return;
    if (videoId !== null && videoId !== undefined && `${liveCreationSession.videoId}` !== `${videoId}`) return;
    liveCreationSession = null;
  }),
}));

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');

  return {
    ...actual,
    api: {
      ...actual.api,
      getVideo: vi.fn(),
      getRelatedVideos: vi.fn(),
      getVideoComments: vi.fn(),
      recordView: vi.fn(),
      likeVideo: vi.fn(),
      unlikeVideo: vi.fn(),
      dislikeVideo: vi.fn(),
      undislikeVideo: vi.fn(),
      saveVideo: vi.fn(),
      unsaveVideo: vi.fn(),
      subscribeToCreator: vi.fn(),
      unsubscribeFromCreator: vi.fn(),
      likeComment: vi.fn(),
      unlikeComment: vi.fn(),
      dislikeComment: vi.fn(),
      undislikeComment: vi.fn(),
      presignUpload: vi.fn(),
      uploadFileDirect: vi.fn(),
      uploadFile: vi.fn(),
      updateVideo: vi.fn(),
      startVideoLive: vi.fn(),
      stopVideoLive: vi.fn(),
      sendLiveSignal: vi.fn(),
      getLiveSignals: vi.fn(),
    },
  };
});

import { api } from '../services/api';
import VideoDetails from './VideoDetails';

let lastPeerConnection = null;

function emitMockHlsError(errorData = { fatal: true }) {
  hlsMockState.lastInstance?.handlers?.[hlsMockState.errorEvent]?.(hlsMockState.errorEvent, errorData);
}

class MockMediaStream {
  constructor(tracks = [{ kind: 'video', stop: vi.fn() }, { kind: 'audio', stop: vi.fn() }]) {
    this._tracks = [...tracks];
  }

  getTracks() {
    return this._tracks;
  }

  addTrack(track) {
    this._tracks.push(track);
  }
}

class MockRTCPeerConnection {
  constructor() {
    this.localDescription = null;
    this.remoteDescription = null;
    this.connectionState = 'new';
    this.onicecandidate = null;
    this.ontrack = null;
    this.onconnectionstatechange = null;
    this.addTrack = vi.fn();
    this.addTransceiver = vi.fn();
    this.createOffer = vi.fn().mockResolvedValue({ type: 'offer', sdp: 'viewer-offer-sdp' });
    this.createAnswer = vi.fn().mockResolvedValue({ type: 'answer', sdp: 'creator-answer-sdp' });
    this.setLocalDescription = vi.fn(async (description) => {
      this.localDescription = description;
    });
    this.setRemoteDescription = vi.fn(async (description) => {
      this.remoteDescription = description;

      if (description?.type === 'answer') {
        this.connectionState = 'connected';
        this.ontrack?.({ streams: [buildMediaStream([{ kind: 'video', stop: vi.fn() }])] });
        this.onconnectionstatechange?.();
      }
    });
    this.addIceCandidate = vi.fn().mockResolvedValue(undefined);
    this.close = vi.fn(() => {
      this.connectionState = 'closed';
    });
    lastPeerConnection = this;
  }
}

class MockMediaRecorder {
  constructor(stream, options = {}) {
    this.stream = stream;
    this.mimeType = options.mimeType || 'video/webm';
    this.state = 'inactive';
    this.ondataavailable = null;
    this.listeners = { stop: [], error: [] };
  }

  static isTypeSupported() {
    return true;
  }

  addEventListener(type, listener) {
    this.listeners[type] = [...(this.listeners[type] || []), listener];
  }

  requestData() {
    if (this.state === 'recording') {
      this.ondataavailable?.({ data: new Blob(['recorded-live'], { type: this.mimeType }) });
    }
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    if (this.state === 'inactive') return;
    this.requestData();
    this.state = 'inactive';
    this.listeners.stop.forEach((listener) => listener());
  }
}

function buildMediaStream(tracks) {
  return new MockMediaStream(tracks);
}

function buildVideo(overrides = {}) {
  return {
    id: 10,
    type: 'video',
    title: 'Alpha Session',
    mediaUrl: 'https://cdn.example.com/alpha.mp4',
    streamUrl: null,
    views: 12,
    author: { id: 5, fullName: 'Creator Uno', username: 'creator.uno', avatarUrl: '', subscriberCount: 33, bio: 'Creadora de sesiones de estudio y tutoriales.' },
    creator: { id: 5, fullName: 'Creator Uno', username: 'creator.uno', avatarUrl: '', subscriberCount: 33, bio: 'Creadora de sesiones de estudio y tutoriales.' },
    currentUserState: { liked: false, disliked: false, saved: false, subscribed: false },
    commentsCount: 0,
    processingStatus: 'completed',
    isLive: false,
    ...overrides,
  };
}

function buildComment(overrides = {}) {
  return {
    id: 20,
    body: 'Great drop',
    likes: 0,
    dislikes: 0,
    repliesCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    user: { id: 5, fullName: 'Creator Uno', username: 'creator.uno', avatarUrl: '' },
    currentUserState: { liked: false, disliked: false },
    ...overrides,
  };
}

function renderPage(initialEntry = '/video/10') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/video/:id" element={<VideoDetails />} />
        <Route path="/live/:id" element={<VideoDetails mode="live" />} />
        <Route path="/video/:id/analytics" element={<div>Analytics page</div>} />
        <Route path="/create" element={<div>Draft editor</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('VideoDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = true;
    authState.user = { id: 99, fullName: 'Viewer Example', avatarUrl: '' };
    hlsMockState.isSupported = true;
    hlsMockState.lastInstance = null;
    lastPeerConnection = null;
    liveCreationSession = null;
    globalThis.MediaStream = MockMediaStream;
    globalThis.RTCPeerConnection = MockRTCPeerConnection;
    globalThis.MediaRecorder = MockMediaRecorder;
    Object.defineProperty(globalThis.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(buildMediaStream()),
      },
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
      configurable: true,
      writable: true,
      value: null,
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'canPlayType', {
      configurable: true,
      value: vi.fn(() => ''),
    });
    api.sendLiveSignal.mockResolvedValue({ data: {} });
    api.getLiveSignals.mockResolvedValue({ data: { signals: [], latestSignalId: 0 } });
    api.presignUpload.mockResolvedValue({ data: { strategy: 'client-direct-upload', endpoint: 'https://upload.example.com', fields: {} } });
    api.uploadFileDirect.mockResolvedValue({ secure_url: 'https://cdn.example.com/live-recording.webm', bytes: 42, duration: 120 });
    api.uploadFile.mockResolvedValue({ data: { upload: { id: 501 } } });
    api.updateVideo.mockResolvedValue({
      data: {
        video: buildVideo({ isDraft: true, mediaUrl: 'https://cdn.example.com/live-recording.webm' }),
      },
    });
  });

  it('renders the recorded video layout with creator details and comments', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo(),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    renderPage();

    await waitFor(() => expect(api.getVideo).toHaveBeenCalledWith('10'));

    expect(await screen.findByRole('heading', { name: 'Alpha Session' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Volver/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suscribirse' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compartir/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reportar/i })).toBeInTheDocument();
    expect(screen.getByText('12 vistas')).toBeInTheDocument();
    expect(screen.getByText('Aún no se ha proporcionado una descripción para este video.')).toBeInTheDocument();
    expect(screen.getByText('Acerca del creador')).toBeInTheDocument();
    expect(screen.getByText('Creadora de sesiones de estudio y tutoriales.')).toBeInTheDocument();
    expect(screen.queryByText('Más videos')).not.toBeInTheDocument();
    expect(screen.getByText('Comentarios')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('¡Dile al creador lo que piensas!')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay comentarios. Empieza la conversación.')).toBeInTheDocument();
  });

  it('shows a view analytics CTA for the creator on their ended live video page', async () => {
    const user = userEvent.setup();
    authState.user = { id: 5, fullName: 'Creator Uno', avatarUrl: '' };

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ liveEndedAt: '2026-04-04T12:12:30Z', liveAnalytics: { peakViewers: 47 } }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    renderPage();

    await screen.findByRole('heading', { name: 'Alpha Session' });
    await user.click(screen.getByRole('link', { name: 'Ver analíticas' }));

    expect(await screen.findByText('Analytics page')).toBeInTheDocument();
  });

  it('uses hls.js for recorded videos when a Cloudinary streamUrl is available', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ streamUrl: 'https://cdn.example.com/alpha.m3u8' }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    const { container } = renderPage();

    await screen.findByRole('heading', { name: 'Alpha Session' });
    const player = container.querySelector('video');

    expect(player).not.toBeNull();
    await waitFor(() => expect(hlsMockState.lastInstance?.loadSource).toHaveBeenCalledWith('https://cdn.example.com/alpha.m3u8'));
    expect(hlsMockState.lastInstance.attachMedia).toHaveBeenCalledWith(player);
  });

  it('falls back to the mp4 playback URL when hls.js reports a fatal error', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ streamUrl: 'https://cdn.example.com/alpha.m3u8' }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    const { container } = renderPage();

    await screen.findByRole('heading', { name: 'Alpha Session' });
    const player = container.querySelector('video');

    expect(player).not.toBeNull();
    await waitFor(() => expect(hlsMockState.lastInstance?.loadSource).toHaveBeenCalledWith('https://cdn.example.com/alpha.m3u8'));

    emitMockHlsError();

    await waitFor(() => expect(hlsMockState.lastInstance.destroy).toHaveBeenCalled());
    expect(player).toHaveAttribute('src', 'https://cdn.example.com/alpha.mp4');
  });

  it('redirects active live videos to the dedicated live room route', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ isLive: true, mediaUrl: '' }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    render(
      <MemoryRouter initialEntries={['/video/10']}>
        <Routes>
          <Route path="/video/:id" element={<VideoDetails />} />
          <Route path="/live/:id" element={<div>Live room route</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => expect(api.getVideo).toHaveBeenCalledWith('10'));
    expect(await screen.findByText('Live room route')).toBeInTheDocument();
  });

  it('links to the creator profile and lets viewers subscribe', async () => {
    const user = userEvent.setup();

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo(),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.subscribeToCreator.mockResolvedValue({
      data: {
        creator: {
          id: 5,
          subscriberCount: 34,
          subscribed: true,
        },
      },
    });

    renderPage();

    const creatorLink = await screen.findByRole('link', { name: /Creator Uno/i });
    expect(creatorLink).toHaveAttribute('href', '/users/5');

    await user.click(screen.getByRole('button', { name: 'Suscribirse' }));

    await waitFor(() => expect(api.subscribeToCreator).toHaveBeenCalledWith(5));
    expect(screen.getByText('34 suscriptores')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suscrito' })).toBeInTheDocument();
  });

  it('links comment authors to their profile pages', async () => {
    const comment = buildComment();

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ commentsCount: 1 }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [comment] } });
    api.recordView.mockResolvedValue({});

    renderPage();

    const commentBody = await screen.findByText('Great drop');
    const commentCard = commentBody.closest('article');

    expect(commentCard).not.toBeNull();
    const authorLinks = within(commentCard).getAllByRole('link', { name: /Creator Uno/i });

    expect(authorLinks).toHaveLength(2);
    authorLinks.forEach((link) => expect(link).toHaveAttribute('href', '/users/5'));
  });

  it('renders clickable mention links in video descriptions and comments', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ description: 'Big thanks to @creator.uno and #guest.user for the collab.' }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({
      data: {
        comments: [buildComment({ body: 'Loved the cameo from @creator.uno and #guest.user.' })],
      },
    });
    api.recordView.mockResolvedValue({});

    renderPage();

    const directMentionLinks = await screen.findAllByRole('link', { name: '@creator.uno' });
    const searchMentionLinks = screen.getAllByRole('link', { name: '#guest.user' });

    expect(directMentionLinks).toHaveLength(2);
    directMentionLinks.forEach((link) => expect(link).toHaveAttribute('href', '/users/5'));
    searchMentionLinks.forEach((link) => expect(link).toHaveAttribute('href', '/search?q=guest.user&tab=creators'));
  });

  it('only saves the video when the save button is clicked', async () => {
    const user = userEvent.setup();

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo(),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.saveVideo.mockResolvedValue({
      data: {
        video: buildVideo({ currentUserState: { liked: false, disliked: false, saved: true, subscribed: false } }),
      },
    });

    renderPage();

    await screen.findByRole('button', { name: /Guardar/i });
    await user.click(screen.getByRole('button', { name: /Guardar/i }));

    await waitFor(() => expect(api.saveVideo).toHaveBeenCalledWith(10));
    expect(api.likeVideo).not.toHaveBeenCalled();
    expect(api.dislikeVideo).not.toHaveBeenCalled();
    expect(api.unlikeVideo).not.toHaveBeenCalled();
    expect(api.undislikeVideo).not.toHaveBeenCalled();
  });

  it('only updates the comment like state when liking a comment', async () => {
    const user = userEvent.setup();
    const comment = buildComment();

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ commentsCount: 1 }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [comment] } });
    api.recordView.mockResolvedValue({});
    api.likeComment.mockResolvedValue({
      data: {
        comment: buildComment({ id: comment.id, likes: 1, currentUserState: { liked: true, disliked: false } }),
      },
    });

    renderPage();

    const commentBody = await screen.findByText('Great drop');
    const commentCard = commentBody.closest('article');

    expect(commentCard).not.toBeNull();
    await user.click(within(commentCard).getByRole('button', { name: /^Me gusta$/i }));

    await waitFor(() => expect(api.likeComment).toHaveBeenCalledWith(20));
    expect(api.dislikeComment).not.toHaveBeenCalled();
    expect(api.undislikeComment).not.toHaveBeenCalled();
    expect(await within(commentCard).findByRole('button', { name: /Me gusta \(1\)/i })).toBeInTheDocument();
  });

  it('shows a processing badge when the video is still being compressed', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({ processingStatus: 'processing' }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});

    renderPage();

    expect(await screen.findByText('PROCESANDO')).toBeInTheDocument();
  });

  it('lets the creator start and stop a live session, then saves the recording as a draft', async () => {
    const user = userEvent.setup();
    authState.user = { id: 99, fullName: 'Creator Uno', avatarUrl: '' };

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.startVideoLive.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.stopVideoLive.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: false,
          isDraft: true,
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.updateVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          isDraft: true,
          mediaUrl: 'https://cdn.example.com/live-recording.webm',
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });

    renderPage('/live/10');

    const startButton = await screen.findByRole('button', { name: 'Iniciar transmisión' });
    await user.click(startButton);

    await waitFor(() => expect(api.startVideoLive).toHaveBeenCalledWith(10));
    expect(await screen.findByText('Tu transmisión en vivo ha comenzado.')).toBeInTheDocument();
    expect(screen.getByText('EN VIVO AHORA')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Detener transmisión' }));

    await waitFor(() => expect(api.stopVideoLive).toHaveBeenCalledWith(10));
    await waitFor(() => expect(api.presignUpload).toHaveBeenCalledWith({ type: 'video', originalName: expect.stringMatching(/^live-10-/) }));
    expect(api.uploadFileDirect).toHaveBeenCalled();
    expect(api.uploadFile).toHaveBeenCalled();
    expect(api.updateVideo).toHaveBeenCalledWith(10, { uploadId: 501, isDraft: true, isLive: false });
    await waitFor(() => expect(screen.getByText('Draft editor')).toBeInTheDocument(), { timeout: 3000 });
  });

  it('blocks backend fallback when stopping a live session without direct upload support', async () => {
    const user = userEvent.setup();
    authState.user = { id: 99, fullName: 'Creator Uno', avatarUrl: '' };

    api.presignUpload.mockResolvedValue({ data: { strategy: 'server-upload' } });
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.startVideoLive.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.stopVideoLive.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: false,
          isDraft: true,
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });

    renderPage('/live/10');

    await user.click(await screen.findByRole('button', { name: 'Iniciar transmisión' }));
    await waitFor(() => expect(api.startVideoLive).toHaveBeenCalledWith(10));

    await user.click(screen.getByRole('button', { name: 'Detener transmisión' }));

    await waitFor(() => expect(api.stopVideoLive).toHaveBeenCalledWith(10));
    await waitFor(() => expect(api.presignUpload).toHaveBeenCalledWith({ type: 'video', originalName: expect.stringMatching(/^live-10-/) }));

    expect(await screen.findByText('Los archivos grandes y los videos deben subirse directamente. Inténtalo de nuevo.')).toBeInTheDocument();
    expect(api.uploadFileDirect).not.toHaveBeenCalled();
    expect(api.uploadFile).not.toHaveBeenCalled();
    expect(api.updateVideo).not.toHaveBeenCalled();
    expect(screen.queryByText('Draft editor')).not.toBeInTheDocument();
  });

  it('shows the creator camera preview in the live room and reuses the preview-live camera stream', async () => {
    authState.user = { id: 99, fullName: 'Creator Uno', avatarUrl: '' };
    liveCreationSession = {
      videoId: 10,
      stream: buildMediaStream(),
      liveSetup: { title: 'Alpha Session' },
    };

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          mediaUrl: '',
          commentsCount: 1,
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [buildComment()] } });
    api.recordView.mockResolvedValue({});

    renderPage('/live/10');

    expect(await screen.findByLabelText('Vista previa de la cámara en vivo')).toBeInTheDocument();
    expect(screen.getByText('Comentarios')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    expect(screen.getByText('Great drop')).toBeInTheDocument();
    expect(globalThis.navigator.mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('uses the joined-live layout on the live watch route while keeping stream interactions', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          mediaUrl: '',
          commentsCount: 1,
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [buildVideo({ id: 11, title: 'Side clip' })] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [buildComment()] } });
    api.recordView.mockResolvedValue({});

    renderPage('/live/10');

    expect(await screen.findByText('Comentarios')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suscribirse' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Compartir/i })).toBeInTheDocument();
    expect(screen.getByText('Great drop')).toBeInTheDocument();
    expect(screen.queryByText('Más videos')).not.toBeInTheDocument();
  });

  it('connects a viewer to the creator live stream over signaling on the live route', async () => {
    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          mediaUrl: '',
          commentsCount: 1,
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [buildComment()] } });
    api.recordView.mockResolvedValue({});
    api.getLiveSignals
      .mockResolvedValueOnce({
        data: {
          signals: [{ id: 1, type: 'answer', payload: { sdp: 'creator-answer-sdp' }, senderId: 5, recipientId: 99 }],
          latestSignalId: 1,
        },
      })
      .mockResolvedValue({ data: { signals: [], latestSignalId: 1 } });

    renderPage('/live/10');

    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, { type: 'offer', sdp: 'viewer-offer-sdp' }));
    await waitFor(() => expect(api.getLiveSignals).toHaveBeenCalledWith(10, { after: 0 }));
    expect(await screen.findByLabelText('Reproductor de la transmisión en vivo')).toBeInTheDocument();
    expect(lastPeerConnection.addTransceiver).toHaveBeenCalledWith('video', { direction: 'recvonly' });
  });

  it('answers viewer offers with the creator camera stream while broadcasting live', async () => {
    authState.user = { id: 99, fullName: 'Creator Uno', avatarUrl: '' };

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          mediaUrl: '',
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.getLiveSignals
      .mockResolvedValueOnce({
        data: {
          signals: [{ id: 9, type: 'offer', payload: { sdp: 'viewer-offer-sdp' }, senderId: 77, recipientId: 99 }],
          latestSignalId: 9,
        },
      })
      .mockResolvedValue({ data: { signals: [], latestSignalId: 9 } });

    renderPage('/live/10');

    await waitFor(() => expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: true }));
    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, expect.objectContaining({ recipientId: 77, type: 'answer', sdp: 'creator-answer-sdp' })));
    expect(lastPeerConnection.addTrack).toHaveBeenCalledTimes(2);
  });

  it('queues viewer ICE candidates that arrive before the live offer reaches the creator', async () => {
    authState.user = { id: 99, fullName: 'Creator Uno', avatarUrl: '' };
    const earlyCandidate = { candidate: 'candidate:1 1 udp 2122260223 127.0.0.1 3478 typ host', sdpMid: '0', sdpMLineIndex: 0 };

    api.getVideo.mockResolvedValue({
      data: {
        video: buildVideo({
          isLive: true,
          mediaUrl: '',
          author: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
          creator: { id: 99, fullName: 'Creator Uno', avatarUrl: '', subscriberCount: 33 },
        }),
      },
    });
    api.getRelatedVideos.mockResolvedValue({ data: { videos: [] } });
    api.getVideoComments.mockResolvedValue({ data: { comments: [] } });
    api.recordView.mockResolvedValue({});
    api.getLiveSignals
      .mockResolvedValueOnce({
        data: {
          signals: [
            { id: 9, type: 'candidate', payload: { candidate: earlyCandidate }, senderId: 77, recipientId: 99 },
            { id: 10, type: 'offer', payload: { sdp: 'viewer-offer-sdp' }, senderId: 77, recipientId: 99 },
          ],
          latestSignalId: 10,
        },
      })
      .mockResolvedValue({ data: { signals: [], latestSignalId: 10 } });

    renderPage('/live/10');

    await waitFor(() => expect(globalThis.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: true }));
    await waitFor(() => expect(api.sendLiveSignal).toHaveBeenCalledWith(10, expect.objectContaining({ recipientId: 77, type: 'answer', sdp: 'creator-answer-sdp' })));
    expect(lastPeerConnection.addIceCandidate).toHaveBeenCalledWith(earlyCandidate);
  });
});