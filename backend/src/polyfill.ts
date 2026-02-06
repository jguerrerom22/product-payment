import 'reflect-metadata';
import * as crypto from 'crypto';

// Make crypto available globally for bundled code
if (typeof globalThis !== 'undefined') {
  (globalThis as any).crypto = crypto;
}
if (typeof global !== 'undefined') {
  (global as any).crypto = crypto;
}

// Also make it available as a module export for require() calls
if (typeof module !== 'undefined' && module.exports) {
  (global as any).crypto = crypto;
}
