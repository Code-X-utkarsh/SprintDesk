import '@testing-library/jest-dom';

// Fix Node 18+ undici / jsdom fetch/Request signal prototype mismatch
const originalRequest = globalThis.Request;
if (originalRequest) {
  // @ts-expect-error patching global Request for jsdom environment compatibility
  globalThis.Request = function (input: unknown, init?: { signal?: unknown }) {
    if (init && init.signal) {
      delete init.signal;
    }
    return new originalRequest(input as RequestInfo, init as RequestInit);
  };
}

// Mock ResizeObserver for Recharts ResponsiveContainer in jsdom environment
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = globalThis.ResizeObserver || ResizeObserverMock;
