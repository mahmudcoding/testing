/* Navigate, click a control, record network + downloads + notices + dialogs. */
import { DOM } from './lib.mjs';
export default async ({ page, ctx }) => {
  const out={reqs:[],dl:null};
  page.on('request', r=>{ const u=r.url(); if(!/_next|\.js|\.css|\.woff|analytics/.test(u)) out.reqs.push(r.method()+' '+u.replace(/^https?:\/\/[^/]+/,'').slice(0,160)); });
  page.on('download', async d=>{ out.dl={suggested:d.suggestedFilename(), url:d.url().slice(0,160)}; });
  await page.goto(process.env.QA_URL, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.reqs=[];
  await page.evaluate(DOM);
  out.click = await page.evaluate((m)=>window.__qa.clickDeepest(new RegExp(m,'i')), process.env.QA_MATCH);
  await page.waitForTimeout(Number(process.env.QA_WAIT||5000));
  await page.evaluate(DOM).catch(()=>{});
  out.after = await page.evaluate(()=>{
    const q=window.__qa;
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis).filter(d=>[...d.querySelectorAll('button')].length<=12);
    return {notices:q.notices(),
      dialog: ds.length?{text:(ds.pop().innerText||'').replace(/\s+/g,' ').slice(0,700)}:null,
      main:(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,400)};
  });
  out.reqs=[...new Set(out.reqs)].filter(u=>/api\/v1|blob|\.csv|\.json|\.txt|\.mp4/.test(u));
  return out;
};
