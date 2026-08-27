import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CASES=[
  {name:'directories', path:'/w/'+WS+'/directories?tab=people', pat:'**/api/v1/workspaces/*/members*',
   empty:/No people match|No members|Nothing here/i},
  {name:'files', path:'/w/'+WS+'/files', pat:'**/api/v1/users/me/files*',
   empty:/No files here|Nothing matches this filter/i},
  {name:'calendar', path:'/w/'+WS+'/calendar', pat:'**/api/v1/calendar/meetings*',
   empty:/No events|Nothing scheduled/i},
];
export default async ({page}) => {
  const out={};
  for(const c of CASES){
    await page.route(c.pat, async r => { await new Promise(res=>setTimeout(res,5000)); await r.continue(); });
    const nav = page.goto(BASE+c.path, {waitUntil:'domcontentloaded'});
    const samples=[];
    for(let i=0;i<34;i++){
      await page.waitForTimeout(300);
      samples.push(await page.evaluate(`(() => {
         const strict=el=>{const r=el.getBoundingClientRect(); if(r.width<24||r.height<12) return false;
           let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
             if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01;};
         const m=document.querySelector('main')||document.body;
         const t=(m.innerText||'').replace(/\\s+/g,' ');
         const sk=[...m.querySelectorAll('[role=progressbar],[class*=skeleton],[class*=animate-pulse],[aria-busy=true]')].filter(strict).length;
         return {len:t.length, skel:sk, txt:t.slice(0,90)}; })()`).catch(()=>({len:-1,skel:-1,txt:'(nav)'})));
    }
    await nav.catch(()=>{});
    const emptyHits = samples.map((s,i)=>({i, t:i*300, txt:s.txt, skel:s.skel}))
      .filter(s=>c.empty.test(s.txt));
    out[c.name]={ samplesWithSkeleton: samples.filter(s=>s.skel>0).length,
                  falseEmptyFrames: emptyHits.length, firstEmptyAt: emptyHits[0]?.t ?? null,
                  emptySample: emptyHits[0]?.txt ?? null,
                  finalText: samples[samples.length-1].txt };
    await page.unroute(c.pat);
  }
  return out;
};
