import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const M=process.env.QA_MEET;
  const ms=Number(process.env.QA_MS||1200000);
  const stepMs=Number(process.env.QA_STEP||30000);
  const out=[]; const t0=Date.now();
  let prev=null;
  while(Date.now()-t0<ms){
    const sample=await page.evaluate(async ({M, RTC})=>{
      const parts=await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json().catch(()=>({}));
      const meet=await (await fetch('/api/v1/meeting/'+M,{credentials:'include'})).json().catch(()=>({}));
      const rtc=await (eval('('+RTC+')'))();
      const sum={outA:0,outV:0,inA:0,inV:0,conns:[]};
      for (const pc of rtc.stats){ sum.conns.push(pc.conn);
        for(const o of pc.out){ if(o.kind==='audio') sum.outA+=o.bytes||0; else sum.outV+=o.bytes||0; }
        for(const o of pc.in){ if(o.kind==='audio') sum.inA+=o.bytes||0; else sum.inV+=o.bytes||0; } }
      return {
        names:(parts.participants||[]).map(p=>p.name).sort(),
        status:(meet.meeting||{}).status,
        rtc:sum,
        banners:[...document.querySelectorAll('[data-testid*="banner" i]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,90)).filter(Boolean),
        toasts:[...document.querySelectorAll('[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,90)).filter(Boolean),
        inCall: !!document.querySelector('[data-testid="call-toolbar"]')
      };
    }, {M, RTC: RTC_STATS});
    const rec={at:Math.round((Date.now()-t0)/1000)+'s', n:sample.names.length, names:sample.names.join(','),
      status:sample.status, conns:sample.rtc.conns.join(','), inCall:sample.inCall,
      dOutV: prev? sample.rtc.outV-prev.outV : null, dInV: prev? sample.rtc.inV-prev.inV : null,
      dOutA: prev? sample.rtc.outA-prev.outA : null,
      banners:sample.banners, toasts:sample.toasts};
    prev=sample.rtc;
    out.push(rec);
    await page.waitForTimeout(stepMs);
  }
  return {samples: out};
};
