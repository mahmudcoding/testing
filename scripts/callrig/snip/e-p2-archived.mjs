import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01', ARCH='C4QEARCHIVE0001';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.api = await page.evaluate(`(async () => {
    const o={};
    const ch=await (await fetch('/api/v1/workspaces/${WS}/channels',{credentials:'include'})).json();
    o.myChannels=(ch.channels||ch.data||[]).map(c=>c.name);
    const r=await fetch('/api/v1/users/me/channels/archived',{credentials:'include'});
    const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){}
    o.archivedEndpoint={st:r.status, list:d? (d.channels||d.data||[]).map(c=>c.name||c.id):t.slice(0,80)};
    return o; })()`);
  out.directoryChannels = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     return (m.innerText||'').replace(/\\s+/g,' ').slice(0,220); })()`);
  out.sidebar = await page.evaluate(`(() => { ${VISFN}
     return [...new Set([...document.querySelectorAll('a')].filter(vis)
       .map(a=>(a.textContent||'').trim()).filter(x=>/^qa-/.test(x)))]; })()`);
  // search: does an archived channel's content appear?
  out.search = await page.evaluate(`(async () => {
    const q='archived';
    const a=await (await fetch('/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&limit=25',{credentials:'include'})).json();
    const b=await (await fetch('/api/v1/search?q='+q+'&company_id=${CO}&workspace_id=${WS}&include_archived=true&limit=25',{credentials:'include'})).json();
    return {plain:{tm:a.total_messages,tc:a.total_channels}, withArchived:{tm:b.total_messages,tc:b.total_channels}}; })()`);
  // open the archived channel by URL
  await page.goto(BASE+'/w/'+WS+'/c/'+ARCH, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.openByUrl = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main')||document.body;
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const composer=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
     return { head:t.slice(0,180),
              hasComposer: !!composer,
              composerEditable: composer? composer.getAttribute('contenteditable'):null,
              mentionsArchived:/archiv/i.test(t),
              buttons:[...new Set([...m.querySelectorAll('button')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(x=>x&&x.length<24))].slice(0,10) }; })()`);
  return out;
};
