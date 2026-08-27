const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
export default async ({page}) => {
  const comp = () => page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  const state = (t) => page.evaluate((tag) => {
    const vis = (el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(vis);
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    return {tag, dialogs:ds.length, dlgText: ds.length? ds[ds.length-1].innerText.replace(/\n+/g,' | ').slice(0,200):null,
      composerHTML: c?c.innerHTML.slice(0,300):null, composerTxt: c?c.innerText.replace(/\n/g,'\\n').slice(0,60):null,
      n: document.querySelectorAll('[data-message-id]').length};
  }, t);
  const out={};
  // dialog is open from the previous snippet — press Insert with an EMPTY field
  out.beforeEmptyInsert = await state('before-empty-insert');
  try { await page.locator('[role="dialog"] button').filter({hasText:/^Insert$/}).last().click({timeout:6000}); } catch(e){ out.e1=String(e).slice(0,80); }
  await page.waitForTimeout(1200);
  out.afterEmptyInsert = await state('after-empty-insert');
  return out;
};
