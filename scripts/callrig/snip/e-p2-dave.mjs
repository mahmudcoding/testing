import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const errs=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/')&&r.status()>=400) errs.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,56)); });
  const look = async (path, label) => {
    await page.goto(BASE+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8000);
    return { label, url:page.url().replace(/^https:\/\/[^/]+/,'').slice(0,60),
      ...(await page.evaluate(`(() => { ${VISFN}
        const m=document.querySelector('main')||document.body;
        return { text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,240),
                 sidebarChannels:[...new Set([...document.querySelectorAll('a')].filter(vis)
                   .map(a=>(a.textContent||'').trim()).filter(x=>/^(qa-|#)/.test(x)))] }; })()`)) };
  };
  out.shell     = await look('/w/'+WS+'/directories?tab=people','directories/people');
  out.channels  = await look('/w/'+WS+'/directories?tab=channels','directories/channels');
  out.files     = await look('/w/'+WS+'/files','files');
  out.calendar  = await look('/w/'+WS+'/calendar','calendar');
  out.search = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/search?q=probe&company_id=O4QEF1XTURESO01&workspace_id=${WS}&limit=25',{credentials:'include'});
    const d=await r.json().catch(()=>null);
    return d? {msgs:(d.messages||[]).length, tm:d.total_messages, files:(d.files||[]).length, tf:d.total_files}:'parse fail'; })()`);
  out.myChannels = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/workspaces/${WS}/channels',{credentials:'include'});
    const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){return t.slice(0,120);}
    const a=d.channels||d.data||[]; return {n:a.length, names:a.map(c=>c.name).slice(0,8)}; })()`);
  out.httpErrors = [...new Set(errs)].slice(0,6);
  return out;
};
