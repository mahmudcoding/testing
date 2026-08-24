import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const outA = async () => { const s = await page.evaluate('('+RTC_STATS+')()');
    return s.stats.reduce((a,pc)=>a+pc.out.filter(o=>o.kind==='audio').reduce((x,o)=>x+(o.bytes||0),0),0); };
  const label = async () => await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;});
  const r={};
  // click a neutral spot on the call stage to move focus off buttons
  const stage = await page.$('[data-testid="call-surface"]');
  if (stage) { const b = await stage.boundingBox(); await page.mouse.click(b.x+b.width/2, b.y+80); }
  await page.waitForTimeout(800);
  r.activeBefore = await page.evaluate(()=>document.activeElement.tagName+'|'+(document.activeElement.getAttribute('data-testid')||document.activeElement.getAttribute('aria-label')||''));
  r.labelIdle = await label();
  // check first if unmuting manually then PTT re-mutes
  const a1 = await outA(); await page.waitForTimeout(5000); const a2 = await outA(); r.idleDelta5s = a2-a1;
  await page.keyboard.down('Space');
  await page.waitForTimeout(1200);
  r.labelHeld = await label();
  r.activeHeld = await page.evaluate(()=>document.activeElement.tagName+'|'+(document.activeElement.getAttribute('aria-label')||''));
  const b1 = await outA(); await page.waitForTimeout(5000); const b2 = await outA(); r.heldDelta5s = b2-b1;
  await page.keyboard.up('Space');
  await page.waitForTimeout(1200);
  r.labelAfter = await label();
  r.micBtn = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||'')); return b?{disabled:b.disabled, title:b.getAttribute('title'), pressed:b.getAttribute('aria-pressed')}:null;});
  r.pttHints = await page.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /space|talk|рация/i.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,60)).slice(0,5));
  return r;
};
