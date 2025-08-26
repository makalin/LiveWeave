import { wsIter } from './websocket.js';
import { sseIter } from './sse.js';
import { pollIter } from './polling.js';
import { parseMs } from '../utils/helpers.js';

export async function getStreamJSON(src, type, opts) {
  switch (type) {
    case 'ws':
      const wsUrl = new URL(src, location.href);
      return {
        async *[Symbol.asyncIterator]() {
          for await (const data of wsIter(wsUrl)) {
            yield JSON.parse(data);
          }
        }
      };
      
    case 'sse':
      return {
        async *[Symbol.asyncIterator]() {
          for await (const data of sseIter(src, opts.credentials === 'include')) {
            yield JSON.parse(data);
          }
        }
      };
      
    default:
      const poll = parseMs(opts.poll);
      return {
        async *[Symbol.asyncIterator]() {
          do {
            const response = await fetch(src, { credentials: opts.credentials });
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`);
            }
            const json = await response.json();
            yield json;
            
            if (poll) {
              await new Promise(resolve => setTimeout(resolve, poll));
            }
          } while (poll);
        }
      };
  }
}
