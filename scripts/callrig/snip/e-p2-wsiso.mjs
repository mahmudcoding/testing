import {VISFN, BASE} from './e-p2-helpers.mjs';
const WS1='W4QEF1XTURESO01', WS2='W4OWJSPNXQJYZ5R', CO='O4QEF1XTURESO01';
export default async ({page}) => {
  const out={};
  // 1. find the ws2 channel and post a uniquely tokened message there
  await page.goto(BASE+'/w/'+WS2+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.ws2channels = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/workspaces/'+'${WS2}'+'/channels',{credentials:'include'});
     const d=await r.json(); const a=d.channels||d.data||[];
     return a.map(c=>({id:c.id, name:c.name})); })()`);
  const ch = out.ws2channels[0];
  if(!ch) return out;
  const TOKEN='wsiso'+process.env.QA_TOK;
  out.post = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'},
       body:JSON.stringify({channel_id:'${ch.id}', body:'workspace isolation probe ${TOKEN}'})});
     const t=await r.text(); return {st:r.status, id:(t.match(/"id":"([^"]+)"/)||[])[1]}; })()`);
  await page.waitForTimeout(6000);
  const search = async (wsId, label) => await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/search?q=${TOKEN}&company_id=${CO}&workspace_id='+'`+wsId+`'+'&limit=25',{credentials:'include'});
     const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){return {raw:t.slice(0,120)};}
     return {label:'`+label+`', tm:d.total_messages, msgs:(d.messages||[]).length,
             bodies:(d.messages||[]).slice(0,2).map(m=>(m.body||'').slice(0,50))}; })()`);
  out.searchFromWs2 = await search(WS2,'ws2 (owns the message) — positive control');
  out.searchFromWs1 = await search(WS1,'ws1 (must not see it)');
  // 3. and via the UI in ws1
  await page.goto(BASE+'/w/'+WS1+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
     if(b) b.click(); })()`);
  await page.waitForTimeout(2500);
  await page.keyboard.type(TOKEN);
  await page.waitForTimeout(4000);
  out.uiFromWs1 = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>120;}).pop();
     const t=(d?d.innerText:'').replace(/\\s+/g,' '); const i=t.indexOf('Relevance');
     return t.slice(i>=0?i:0,(i>=0?i:0)+160); })()`);
  await page.keyboard.press('Escape');
  out.token = TOKEN;
  return out;
};
