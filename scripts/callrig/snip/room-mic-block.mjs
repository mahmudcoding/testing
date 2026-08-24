import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const M=process.env.QA_MEET;
  const sum = s => s.stats.map(pc=>({conn:pc.conn, outA:pc.out.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0)}));
  const win = async (label,secs)=>{ const a=sum(await page.evaluate('('+RTC_STATS+')()')); await page.waitForTimeout(secs*1000); const b=sum(await page.evaluate('('+RTC_STATS+')()'));
    const ui = await page.evaluate(()=>{const t=document.querySelector('[data-testid="call-toolbar"]'); return {mic:[...t.querySelectorAll('button')].map(x=>x.getAttribute('aria-label')).filter(l=>/mute|microphone/i.test(l||'')), tabs:(document.querySelector('[data-testid="call-header-tabs"]')||{innerText:''}).innerText.replace(/\n+/g,' | ').slice(0,90)};});
    return {label, pcs: b.map((x,i)=>({conn:x.conn, d_outAudio: x.outA-(a[i]?a[i].outA:0)})), ...ui}; };
  const out=[];
  out.push(await win('before block', 6));
  const perms = await page.evaluate(async (M)=>{
    const uid=(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).id;
    return (await (await fetch('/api/v1/meeting/'+M+'/participants/'+uid+'/permissions',{credentials:'include'})).text()).slice(0,200);
  }, M);
  out.push({permsBefore: perms});
  return out;
};
