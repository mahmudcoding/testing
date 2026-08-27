import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const routes=['/directories','/directories?tab=channels','/calendar','/files','/chat/saved',
                '/chat/mentions','/settings/account','/settings/appearance','/settings/sessions',
                '/c/C4QEGENERAL0001','/c/C4QEPRIVATE0001'];
  const out=[];
  for (const r of routes) {
    const errs=[], bad=[];
    const onCon=m=>{ if(m.type()==='error') errs.push((m.text()||'').slice(0,110)); };
    const onRes=x=>{ const u=x.url(); if(/\/api\/v1\//.test(u)&&x.status()>=400)
      bad.push(x.status()+' '+u.replace(/https?:\/\/[^/]+/,'').replace(/(company_id|workspace_id)=[^&]*/g,'$1=<x>').slice(0,80)); };
    const onErr=e=>errs.push('PAGEERROR '+(e.message||'').slice(0,110));
    page.on('console',onCon); page.on('response',onRes); page.on('pageerror',onErr);
    await page.goto(`${BASE}/w/${WS}${r}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5200);
    page.off('console',onCon); page.off('response',onRes); page.off('pageerror',onErr);
    const shell = await page.evaluate(()=>({
      hasMain: !!document.querySelector('main'),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      title: (document.querySelector('h1,h2')||{textContent:''}).textContent.trim().slice(0,28)}));
    out.push({route:r, consoleErrors:errs.length, badApi:bad.length, errs:errs.slice(0,2), bad:bad.slice(0,3), shell});
  }
  return out;
};
