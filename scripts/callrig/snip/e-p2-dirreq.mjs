import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const seen=[];
  page.on('response', async r => { const u=r.url();
    if (/\/api\/v1\/.*(channel|director)/i.test(u) && r.request().method()==='GET') {
      let b=''; try{ b=await r.text(); }catch(e){}
      seen.push({u:u.replace(/^https:\/\/[^/]+/,'').slice(0,110), s:r.status(), body:b}); } });
  await page.goto(BASE+'/w/'+WS+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.requests = seen.map(x=>x.u+' -> '+x.s+' ('+x.body.length+'B)');
  out.bodies = seen.filter(x=>x.body.length<3000).map(x=>{
    try { const j=JSON.parse(x.body); const a=j.channels||j.data||j.items||[];
      return x.u.slice(0,60)+' => '+(Array.isArray(a)? a.map(c=>(c.name||c.id)+'/'+(c.type||'?')+(c.is_member!==undefined?'/member='+c.is_member:'')).join(', ') : Object.keys(j).join(','));
    } catch(e){ return x.u.slice(0,60)+' => (unparsed) '+x.body.slice(0,90); } });
  out.uiRows = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    return (m.innerText||'').replace(/\\n+/g,' | ').slice(0,220); })()`);
  out.sidebarHasPrivate = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,20)); })()`);
  return out;
};
