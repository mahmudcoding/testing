import { DOM } from './lib.mjs';
// QA_SEL='button[aria-label="Unmute"]' — hover it and report tooltip / title / describedby
export default async ({page}) => {
  await page.evaluate(DOM);
  const sel = process.env.QA_SEL || 'button[aria-label="Unmute"]';
  const el = await page.$(sel);
  if (!el) return {found:false, sel};
  const attrs = await el.evaluate(e => {
    const o = {}; for (const a of e.attributes) o[a.name] = a.value.slice(0,120);
    const cs = getComputedStyle(e);
    return {attrs:o, cursor: cs.cursor, opacity: cs.opacity, pe: cs.pointerEvents,
      describedby: e.getAttribute('aria-describedby'),
      dbText: (()=>{const id=e.getAttribute('aria-describedby'); if(!id) return null;
        return id.split(/\s+/).map(i=>{const n=document.getElementById(i); return n?n.textContent.trim():null;}).join(' | ');})()};
  });
  const before = await page.evaluate(()=>[...document.querySelectorAll('[role=tooltip],[data-radix-popper-content-wrapper]')].map(e=>e.textContent.trim()));
  const b = await el.boundingBox();
  await page.mouse.move(b.x+b.width/2, b.y+b.height/2);
  const seen = [];
  for (let i=0;i<14;i++){
    await page.waitForTimeout(300);
    const t = await page.evaluate(()=>{const q=window.__qa;
      return [...document.querySelectorAll('[role=tooltip],[data-radix-popper-content-wrapper],[data-state=delayed-open]')]
        .filter(e=>{const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;})
        .map(e=>(e.textContent||'').trim().slice(0,200));});
    for (const x of t) if (!seen.includes(x)) seen.push(x);
  }
  return {found:true, sel, ...attrs, before, tooltipsSeen: seen};
};
