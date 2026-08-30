import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const before = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||''));
    return b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed'),d:b.disabled}:null;});
  await page.click('body', {position:{x:960, y:400}}).catch(()=>{});
  await page.keyboard.press(process.env.QA_KEY || 'Meta+d');
  const seen=[];
  for (let i=0;i<20;i++){ await page.waitForTimeout(400);
    const s = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||''));
      return b?b.getAttribute('aria-label')+'/'+b.getAttribute('aria-pressed'):null;});
    if(!seen.length||seen[seen.length-1]!==s) seen.push(s); }
  return {before, timeline: seen};
};
