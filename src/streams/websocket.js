export async function* wsIter(url) {
  const ws = new WebSocket(url);
  
  await new Promise(resolve => {
    ws.addEventListener('open', resolve, { once: true });
  });
  
  const queue = [];
  let resolve;
  
  ws.addEventListener('message', (event) => {
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
    ws.close();
  }
}
