// LiveWeave – tiny realtime HTML layer (MIT)
// Modern browsers: Chrome/Edge 114+, Firefox 115+, Safari 16+
// Drop-in: <script type="module" src="/liveweave.min.js"></script>
const __LW_VERSION__ = '0.1.0';

const q = (o,p)=>p?.split('.').reduce((a,c)=>a?.[c],o);
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
const signals = new Map();
const bc = ('BroadcastChannel' in self) ? new BroadcastChannel('liveweave') : null;
if (bc) bc.onmessage = e => dispatchEvent(new CustomEvent('lw:signal', {detail:e.data}));

function parseMs(s){
  if(!s) return 0;
  const m = /^(\d+)(ms|s|m)$/i.exec(s.trim());
  if(!m) return 0;
  const n = +m[1];
  return m[2].toLowerCase()==='ms'?n: m[2].toLowerCase()==='s'?n*1000: n*60000;
}

async function* wsIter(url){
  const ws = new WebSocket(url);
  await new Promise(res=>ws.addEventListener('open',res,{once:true}));
  const queue = [];
  let resolve;
  ws.addEventListener('message', ev=>{ queue.push(ev.data); if(resolve){ resolve(); resolve=null; } });
  while(true){
    if(queue.length===0){ await new Promise(r=>resolve=r); }
    const d = queue.shift();
    yield d;
  }
}

async function* sseIter(url, withCreds){
  const es = new EventSource(url, {withCredentials: withCreds});
  const queue = [];
  let resolve;
  es.addEventListener('message', ev=>{ queue.push(ev.data); if(resolve){ resolve(); resolve=null; } });
  while(true){
    if(queue.length===0){ await new Promise(r=>resolve=r); }
    const d = queue.shift();
    yield d;
  }
}

async function getStreamJSON(src, type, opts){
  if(type==='ws'){
    const u = new URL(src, location.href);
    return { async *[Symbol.asyncIterator](){ for await (const d of wsIter(u)) yield JSON.parse(d); } };
  }
  if(type==='sse'){
    return { async *[Symbol.asyncIterator](){ for await (const d of sseIter(src, opts.credentials==='include')) yield JSON.parse(d); } };
  }
  const poll = parseMs(opts.poll);
  return { async *[Symbol.asyncIterator](){
    do {
      const r = await fetch(src, {credentials: opts.credentials});
      if (!r.ok) throw new Error('HTTP '+r.status);
      const j = await r.json();
      yield j;
      if (poll) await sleep(poll);
    } while (poll);
  }};
}

class LWBase extends HTMLElement{
  connectedCallback(){ this._connected=true; this.mount?.(); }
  disconnectedCallback(){ this._connected=false; this.unmount?.(); }
  get opts(){ return {
    type: (this.getAttribute('type')||'json').toLowerCase(),
    poll: this.getAttribute('poll')||'',
    credentials: (this.getAttribute('auth')||'omit')
  }; }
  setLoading(on){
    if(this.hasAttribute('loading')){
      const txt = this.getAttribute('loading') || '…';
      if(on) this.textContent = txt;
    }
  }
  setError(e){
    const msg = this.getAttribute('error') || ('⚠️ '+(e?.message||e));
    this.textContent = msg;
  }
}

class LWText extends LWBase{
  async mount(){
    const src=this.getAttribute('src'); const sel=this.getAttribute('select');
    if(!src){ this.textContent=''; return; }
    try{
      this.setLoading(true);
      for await (const data of await getStreamJSON(src, this.opts.type, this.opts)){
        const v = sel ? q(data, sel) : data;
        if (v!=null) this.textContent = String(v);
        if (this.hasAttribute('once')) break;
      }
    }catch(e){ this.setError(e); }
  }
}
customElements.define('lw-text', LWText);

class LWHTML extends LWBase{
  sanitize(html){
    const t=document.createElement('template');
    t.innerHTML=String(html);
    t.content.querySelectorAll('script,iframe,object,embed,link').forEach(n=>n.remove());
    t.content.querySelectorAll('*').forEach(el=>{ [...el.attributes].forEach(a=>{ if(/^on/i.test(a.name)) el.removeAttribute(a.name); }); });
    return t.innerHTML;
  }
  async mount(){
    const src=this.getAttribute('src'); const sel=this.getAttribute('select');
    try{
      this.setLoading(true);
      for await (const data of await getStreamJSON(src, this.opts.type, this.opts)){
        const v = sel ? q(data, sel) : data;
        this.innerHTML = this.sanitize(v ?? '');
        if (this.hasAttribute('once')) break;
      }
    }catch(e){ this.setError(e); }
  }
}
customElements.define('lw-html', LWHTML);

class LWFor extends LWBase{
  async mount(){
    const src=this.getAttribute('src'); const sel=this.getAttribute('select');
    const as=this.getAttribute('as')||'item';
    const tpl=this.innerHTML;
    try{
      this.setLoading(true);
      for await (const data of await getStreamJSON(src, this.opts.type, this.opts)){
        const arr = sel ? q(data, sel) : data;
        if (!Array.isArray(arr)){ this.innerHTML=''; continue; }
        this.innerHTML = arr.map((it,i)=>tpl
          .replaceAll(`{{${as}.`,'{{__dot__.')
          .replace(/\{\{__dot__\.(.+?)\}\}/g,(_,p)=>q(it,p)??'')
          .replaceAll('{{i}}',i)).join('');
        if (this.hasAttribute('once')) break;
      }
    }catch(e){ this.setError(e); }
  }
}
customElements.define('lw-for', LWFor);

class LWIf extends LWBase{
  async mount(){
    const src=this.getAttribute('src'); const test=this.getAttribute('test')||'true';
    const content=this.innerHTML; this._saved=content;
    try{
      for await (const data of await getStreamJSON(src, this.opts.type, this.opts)){
        const keys = Object.keys(data||{});
        const vals = Object.values(data||{});
        let ok=false;
        try{ ok = Function(...keys, `return !!(${test});`)(...vals); }catch{ ok=false; }
        this.innerHTML = ok ? this._saved : '';
        if (this.hasAttribute('once')) break;
      }
    }catch(e){ this.setError(e); }
  }
}
customElements.define('lw-if', LWIf);

class LWTime extends LWBase{
  connectedCallback(){
    const val = this.getAttribute('value');
    const fmt = (this.getAttribute('format')||'relative').toLowerCase();
    const dt = val ? new Date(val) : new Date();
    if (fmt==='relative' || fmt==='ago'){
      const upd=()=>{
        const s=Math.floor((Date.now()-dt.getTime())/1000);
        const v=s<60?`${s}s`: s<3600?`${Math.floor(s/60)}m`: s<86400?`${Math.floor(s/3600)}h`: `${Math.floor(s/86400)}d`;
        this.textContent = fmt==='ago' ? `${v} ago` : v;
      };
      upd(); this._int=setInterval(upd,1000);
    } else {
      try{ this.textContent = new Intl.DateTimeFormat(undefined, {dateStyle:'medium', timeStyle:'short'}).format(dt); }
      catch{ this.textContent = dt.toLocaleString(); }
    }
  }
  disconnectedCallback(){ if(this._int) clearInterval(this._int); }
}
customElements.define('lw-time', LWTime);

// Signals (in-tab + cross-tab)
addEventListener('lw:signal', e=>{
  const {name, op, value} = e.detail||{};
  if(!name) return;
  let cur = signals.get(name) || {};
  if(op==='set') cur=value;
  else if(op==='merge') cur={...cur, ...value};
  else if(op==='clear') cur={};
  signals.set(name, cur);
  document.querySelectorAll(`lw-on[name="${name}"]`).forEach(el=>el.render());
  if (bc) bc.postMessage({name, op, value});
});

class LWOn extends LWBase{
  connectedCallback(){ this.render(); }
  render(){
    const name=this.getAttribute('name');
    const data = signals.get(name)||{};
    const tpl=this.innerHTML;
    this.innerHTML = tpl.replace(/\{\{\s*\$signal(?:\.(.+?))?\s*\}\}/g,(_,p)=> p?q({$signal:data}, `$signal.${p}`): JSON.stringify({$signal:data}, null, 2));
  }
}
customElements.define('lw-on', LWOn);

// <form is="lw-form">
class LWForm extends HTMLFormElement{
  connectedCallback(){
    if(this.getAttribute('live')!=null){
      const mode=this.getAttribute('on')||'submit';
      this.addEventListener(mode, e=>{
        if(mode!=='submit' || this.getAttribute('live')!=null) e.preventDefault();
        const fd=new FormData(this); const body=Object.fromEntries(fd.entries());
        fetch(this.action||this.getAttribute('action'), {
          method:(this.method||this.getAttribute('method')||'POST').toUpperCase(),
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify(body)
        }).catch(()=>{});
      });
    }
  }
}
customElements.define('lw-form', LWForm, {extends:'form'});

console.debug('[LiveWeave]', __LW_VERSION__);
