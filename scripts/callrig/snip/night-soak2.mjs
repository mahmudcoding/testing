import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const M=process.env.QA_MEET;
  const ms=Number(process.env.QA_MS||1500000);
  const stepMs=Number(process.env.QA_STEP||30000);
  const out=[]; const t0=Date.now(); let prev=null;
  while(Date.now()-t0<ms){
    const info=await page.evaluate(async (M)=>{
      const p=await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json().catch(()=>({}));
      const m=await (await fetch('/api/v1/meeting/'+M,{credentials:'include'})).json().catch(()=>({}));
      return {names:(p.participants||[]).map(x=>x.name).sort(), status:(m.meeting||{}).status,
        inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
        tiles: document.querySelectorAll('[data-testid="participant-tile"]').length,
        banners:[...document.querySelectorAll('[data-testid*="banner" i],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,80)).filter(Boolean)};
    }, M);
    const rtc=await page.evaluate('('+RTC_STATS+')()');
    const sum={outA:0,outV:0,inA:0,inV:0,conns:[]};
    for (const pc of rtc.stats){ sum.conns.push(pc.conn);
      for(const o of pc.out){ if(o.kind==='audio') sum.outA+=o.bytes||0; else sum.outV+=o.bytes||0; }
      for(const o of pc.in){ if(o.kind==='audio') sum.inA+=o.bytes||0; else sum.inV+=o.bytes||0; } }
    out.push({at:Math.round((Date.now()-t0)/1000)+'s', n:info.names.length, names:info.names.join(','),
      status:info.status, inCall:info.inCall, tiles:info.tiles, conns:sum.conns.join(','),
      dOutA: prev? sum.outA-prev.outA:null, dOutV: prev? sum.outV-prev.outV:null,
      dInA: prev? sum.inA-prev.inA:null, dInV: prev? sum.inV-prev.inV:null,
      banners:info.banners});
    prev=sum;
    await page.waitForTimeout(stepMs);
  }
  return {samples: out};
};
