import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEARCHIVE0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||j?.data?.email||'?';})()`);
  out.screen = await page.evaluate(`(() => { ${VISFN}
    const main=document.querySelector('main')||document.body;
    return { text:(main.innerText||'').replace(/\\n+/g,' | ').slice(0,500),
      ctrls: interactives(main).map(d=>d.label.slice(0,30)+(d.disabled?'[DIS]':'')).join(' | ').slice(0,700) };
  })()`);
  // open the archived dialog and quote its copy exactly
  await page.locator('button[aria-label="Open archived channels"]').first().click();
  await page.waitForTimeout(1800);
  out.dialogCopy = await page.evaluate(`(() => { const d=[...document.querySelectorAll('[role=dialog]')].pop(); return d? (d.innerText||'').slice(0,400) : null; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  return out;
};
