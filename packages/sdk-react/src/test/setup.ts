import '@testing-library/jest-dom';
import { mock, afterEach } from 'bun:test';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  mock.restore();
});
