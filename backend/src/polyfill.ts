import 'reflect-metadata';
import * as cryptoModule from 'crypto';

/**
 * Node 19+ has globalThis.crypto as a read-only getter.
 * We only need to polyfill if it's missing or if we need to ensure specific legacy behavior.
 */
function polyfillCrypto() {
  const target = typeof globalThis !== 'undefined' ? globalThis : 
                 typeof global !== 'undefined' ? global : 
                 typeof window !== 'undefined' ? window : {};

  try {
    // If it's already there (like in Node 20), don't try to overwrite it
    if (!(target as any).crypto) {
      Object.defineProperty(target, 'crypto', {
        value: cryptoModule,
        configurable: true,
        enumerable: true,
        writable: true
      });
    }
  } catch (e) {
    console.warn('Could not polyfill crypto:', e.message);
  }
}

polyfillCrypto();

// Also make it available as a module export for require() calls if needed
if (typeof module !== 'undefined' && module.exports) {
  // @ts-ignore
  module.exports.crypto = cryptoModule;
}
