import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const M=process.env.QA_MEET;
  const ui=await page.evaluate(()=>({
    inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
    overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    topBar:(t=>t?t.innerText.replace(/\n+/g,' | ').slice(0,120):null)(document.querySelector('[data-testid="call-top-bar"]')),
    tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{const n=t.querySelector('[data-testid="participant-name"]');return n?n.innerText.trim():'?';}),
    banners:[...document.querySelectorAll('[data-testid*="banner" i],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,90)).filter(Boolean)
  }));
  const rtc=await page.evaluate('('+RTC_STATS+')()');
  const server=await page.evaluate(async (M)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const p=await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json().catch(()=>({}));
    const cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>({}));
    return {me:me.email, names:(p.participants||[]).map(x=>x.name), current: cur.meeting? cur.meeting.id : null};
  }, M);
  return {ui, rtcPcs: rtc.pcs, conns: rtc.stats.map(s=>s.conn), inbound: rtc.stats.map(s=>s.in.length), server};
};
