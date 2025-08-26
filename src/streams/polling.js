import { sleep } from '../utils/helpers.js';

export async function* pollIter(url, credentials, interval) {
  do {
    const response = await fetch(url, { credentials });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const json = await response.json();
    yield json;
    
    if (interval) {
      await sleep(interval);
    }
  } while (interval);
}
