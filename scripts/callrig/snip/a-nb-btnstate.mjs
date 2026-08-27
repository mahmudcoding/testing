import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const rx = new RegExp(process.env.QA_RXBTN || '^Turn camera (on|off)$');
  await page.mouse.move(700,500); await page.waitForTimeout(500);
  return await page.evaluate(([r,v])=>{ const vis=eval(v); const re=new RegExp(r);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>re.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return {err:'not found'};
    return {al:b.getAttribute('aria-label'), disabled:b.disabled, title:b.getAttribute('title'),
      pressed:b.getAttribute('aria-pressed'), describedby:b.getAttribute('aria-describedby'),
      desc:(()=>{const id=b.getAttribute('aria-describedby'); if(!id) return null;
        const e=document.getElementById(id); return e?{txt:(e.textContent||'').trim().slice(0,90),
          box:(()=>{const q=e.getBoundingClientRect();return Math.round(q.width)+'x'+Math.round(q.height);})()}:null;})()};
  }, [rx.source, VIS]);
};
