import { VIS } from './a-nb-lib.mjs';
const STATE = `(v) => { const vis=eval(v);
  const b=[...document.querySelectorAll('button')].filter(vis).map(x=>(x.getAttribute('aria-label')||'').trim());
  const pcs=window.__pcs||[]; const tr=[];
  for (const pc of pcs) for (const s of pc.getSenders()) if (s.track) tr.push(s.track.kind+':'+s.track.enabled);
  return {mic:b.filter(x=>/^(Mute|Unmute)$/.test(x))[0]||null,
          cam:b.filter(x=>/^Turn camera (on|off)$/.test(x))[0]||null, tracks:tr,
          dlg:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
              .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded')
              .map(d=>(d.innerText||'').replace(/\\s+/g,' ').slice(0,90))};
}`;
export default async ({page}) => {
  const key = process.env.QA_KEY || 'Meta+d';
  const out={key};
  await page.mouse.move(700,500); await page.waitForTimeout(500);
  await page.evaluate(()=>{const el=document.querySelector('[data-testid="call-overlay-expanded"]'); if(el&&el.focus) el.focus();});
  out.before = await page.evaluate(([v,s])=>eval('('+s+')')(v), [VIS, STATE]);
  await page.keyboard.press(key);
  await page.waitForTimeout(3000);
  out.after = await page.evaluate(([v,s])=>eval('('+s+')')(v), [VIS, STATE]);
  return out;
};
