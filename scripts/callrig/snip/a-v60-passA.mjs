const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.livekit = await page.evaluate(()=>{
    const g=globalThis;
    return { sdkKeys:Object.keys(g).filter(k=>/livekit|lk/i.test(k)).slice(0,6),
      scripts:[...document.querySelectorAll('script[src]')].map(s=>s.src.split('/').pop()).filter(s=>/livekit|call/i.test(s)).slice(0,4) };});
  out.breakoutVocab = await page.evaluate(()=>({
    breakoutVisible:/breakout/i.test(document.body.innerText),
    sideRoomVisible:/side room/i.test(document.body.innerText),
    breakoutHTMLHits:(document.body.innerHTML.match(/breakout/gi)||[]).length }));
  return out;
};
