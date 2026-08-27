import { RTC_STATS } from './lib.mjs';
export default async ({page, ctx}) => {
  const secs = Number(process.env.QA_SECS || 20);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  const snap = async (tag) => {
    let rtc = {}; try {
      const r = await page.evaluate('('+RTC_STATS+')()');
      const st = (r.stats||[])[0]||{};
      const sum=(a,k)=>(a||[]).reduce((x,y)=>x+(y[k]||0),0);
      rtc = {conn:st.conn, ice:st.ice, inB:sum(st.in,'bytes'), outB:sum(st.out,'bytes')};
    } catch(e){ rtc={err:String(e).slice(0,40)}; }
    const ui = await page.evaluate(()=>{
      const tb=document.querySelector('[data-testid="call-top-bar"]');
      const body=document.body.innerText;
      return {top: tb?tb.innerText.replace(/\n+/g,' | ').slice(0,70):null,
        inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
        recon: /reconnect|Reconnecting|connection lost|Poor connection|offline|No connection/i.test(body)
                 ? (body.match(/[^\n]*(?:econnect|onnection lost|oor connection|ffline|o connection)[^\n]*/)||[''])[0].trim().slice(0,60) : null,
        online: navigator.onLine};
    });
    return {tag, ...ui, ...rtc};
  };
  const tl = [await snap('before')];
  await cdp.send('Network.emulateNetworkConditions',
    {offline:true, latency:0, downloadThroughput:0, uploadThroughput:0});
  for (const at of [3,8,15,secs]) {
    await page.waitForTimeout(at===3?3000:(at===8?5000:(at===15?7000:(secs-15)*1000)));
    tl.push(await snap('off+'+at+'s'));
  }
  await cdp.send('Network.emulateNetworkConditions',
    {offline:false, latency:0, downloadThroughput:-1, uploadThroughput:-1});
  for (const at of [5,15,30]) {
    await page.waitForTimeout(at===5?5000:10000);
    tl.push(await snap('back+'+at+'s'));
  }
  return {timeline: tl};
};
