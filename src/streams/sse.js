export async function* sseIter(url, withCredentials) {
  const eventSource = new EventSource(url, { withCredentials });
  
  const queue = [];
  let resolve;
  
  eventSource.addEventListener('message', (event) => {
    queue.push(event.data);
    if (resolve) {
      resolve();
      resolve = null;
    }
  });
  
  try {
    while (true) {
      if (queue.length === 0) {
        await new Promise(r => resolve = r);
      }
      const data = queue.shift();
      yield data;
    }
  } finally {
    eventSource.close();
  }
}
