import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const M='V4OTLVMJL42ZGIG';
  const me = await page.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  const perms = await page.evaluate(async (M) => {
    const uid = (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).id;
    const a = await (await fetch('/api/v1/meeting/'+M+'/participants/'+uid+'/permissions',{credentials:'include'})).text();
    const b = await (await fetch('/api/v1/meeting/'+M+'/my-permissions',{credentials:'include'})).text();
    return {uid, effective: a.slice(0,300), role: (JSON.parse(b).role)};
  }, M);
  const a = await page.evaluate('('+RTC_STATS+')()');
  await page.waitForTimeout(6000);
  const b = await page.evaluate('('+RTC_STATS+')()');
  const sum = s => s.stats.map(pc=>({outA:pc.out.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0), outV:pc.out.filter(o=>o.kind==='video').reduce((x,o)=>x+(o.bytes||0),0)}));
  const A=sum(a),B=sum(b);
  const ui = await page.evaluate(() => {
    const tb = document.querySelector('[data-testid="call-toolbar"]');
    return {toolbar: tb? [...tb.querySelectorAll('button')].map(x=>`${(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,32)}#${x.getAttribute('data-testid')||'-'}${x.disabled?' DIS':''}`) : null,
            banners: [...document.querySelectorAll('[role="status"],[role="alert"],[data-sonner-toast]')].map(t=>t.innerText.replace(/\n+/g,' ').slice(0,140)).filter(Boolean)};
  });
  return {me, perms, d_outAudio: B.map((x,i)=>x.outA-A[i].outA), d_outVideo: B.map((x,i)=>x.outV-A[i].outV), ui};
};
