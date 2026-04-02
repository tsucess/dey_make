import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api } from "./api";

class MockXMLHttpRequest {
  static instances = [];

  constructor() {
    this.headers = {};
    this.listeners = {};
    this.uploadListeners = {};
    this.status = 0;
    this.responseText = "";
    this.upload = {
      addEventListener: (type, listener) => {
        this.uploadListeners[type] = listener;
      },
    };
    MockXMLHttpRequest.instances.push(this);
  }

  static reset() {
    MockXMLHttpRequest.instances = [];
  }

  open(method, url) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key, value) {
    this.headers[key] = value;
  }

  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }

  send(body) {
    this.body = body;
  }

  emitUploadProgress(loaded, total) {
    this.uploadListeners.progress?.({ loaded, total });
  }

  respond(status, payload) {
    this.status = status;
    this.responseText = typeof payload === "string" ? payload : JSON.stringify(payload);
    this.listeners.load?.();
  }
}

describe("api.uploadFileDirect", () => {
  const originalXmlHttpRequest = globalThis.XMLHttpRequest;

  beforeEach(() => {
    MockXMLHttpRequest.reset();
    globalThis.XMLHttpRequest = MockXMLHttpRequest;
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = originalXmlHttpRequest;
    vi.restoreAllMocks();
  });

  it("uploads smaller files in a single direct request", async () => {
    const onProgress = vi.fn();
    const file = new File(["video"], "clip.mp4", { type: "video/mp4" });

    const uploadPromise = api.uploadFileDirect(file, {
      endpoint: "https://api.cloudinary.com/v1_1/demo/video/upload",
      method: "POST",
      fields: { signature: "signed", timestamp: 123 },
    }, { onProgress });

    expect(MockXMLHttpRequest.instances).toHaveLength(1);

    const request = MockXMLHttpRequest.instances[0];
    request.emitUploadProgress(3, file.size);
    request.respond(200, { secure_url: "https://res.cloudinary.com/demo/video/upload/v1/clip.mp4" });

    await expect(uploadPromise).resolves.toEqual({
      secure_url: "https://res.cloudinary.com/demo/video/upload/v1/clip.mp4",
    });
    expect(request.method).toBe("POST");
    expect(request.url).toBe("https://api.cloudinary.com/v1_1/demo/video/upload");
    expect(request.body.get("signature")).toBe("signed");
    expect(request.body.get("timestamp")).toBe("123");
    expect(request.body.get("file")).toBeInstanceOf(File);
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      loaded: 3,
      total: file.size,
      percent: expect.any(Number),
    }));
    expect(onProgress).toHaveBeenLastCalledWith({ loaded: file.size, total: file.size, percent: 100 });
  });

  it("uploads large files in direct-upload chunks with stable chunk headers", async () => {
    const megaByte = 1024 * 1024;
    const fileSize = 101 * megaByte;
    const chunkSize = 40 * megaByte;
    const onProgress = vi.fn();
    const file = {
      name: "movie.mp4",
      size: fileSize,
      type: "video/mp4",
      slice: (start, end) => new Blob([`${start}-${end}`], { type: "video/mp4" }),
    };

    const uploadPromise = api.uploadFileDirect(file, {
      endpoint: "https://api.cloudinary.com/v1_1/demo/video/upload",
      method: "POST",
      chunkSize,
      fields: { signature: "signed" },
    }, { onProgress });

    expect(MockXMLHttpRequest.instances).toHaveLength(1);

    const firstRequest = MockXMLHttpRequest.instances[0];
    firstRequest.emitUploadProgress(20 * megaByte, chunkSize);
    firstRequest.respond(200, { done: false });
    await Promise.resolve();

    expect(MockXMLHttpRequest.instances).toHaveLength(2);

    const secondRequest = MockXMLHttpRequest.instances[1];
    secondRequest.respond(200, { done: false });
    await Promise.resolve();

    expect(MockXMLHttpRequest.instances).toHaveLength(3);

    const thirdRequest = MockXMLHttpRequest.instances[2];
    thirdRequest.respond(200, { secure_url: "https://res.cloudinary.com/demo/video/upload/v1/movie.mp4" });

    await expect(uploadPromise).resolves.toEqual({
      secure_url: "https://res.cloudinary.com/demo/video/upload/v1/movie.mp4",
    });

    expect(firstRequest.headers["Content-Range"]).toBe(`bytes 0-${chunkSize - 1}/${fileSize}`);
    expect(secondRequest.headers["Content-Range"]).toBe(`bytes ${chunkSize}-${(chunkSize * 2) - 1}/${fileSize}`);
    expect(thirdRequest.headers["Content-Range"]).toBe(`bytes ${chunkSize * 2}-${fileSize - 1}/${fileSize}`);
    expect(firstRequest.headers["X-Unique-Upload-Id"]).toBeTruthy();
    expect(secondRequest.headers["X-Unique-Upload-Id"]).toBe(firstRequest.headers["X-Unique-Upload-Id"]);
    expect(thirdRequest.headers["X-Unique-Upload-Id"]).toBe(firstRequest.headers["X-Unique-Upload-Id"]);
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      loaded: 20 * megaByte,
      total: fileSize,
      percent: 20,
    }));
    expect(onProgress).toHaveBeenLastCalledWith({ loaded: fileSize, total: fileSize, percent: 100 });
  });
});