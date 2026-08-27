const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const out={};
  const state = (t) => page.evaluate((tag)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const c=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')].pop();
    let box=c; for(let i=0;i<6&&box;i++) box=box.parentElement;
    return {tag, composerArea: box? box.innerText.replace(/\n+/g,' | ').slice(-240):null,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(vis).map(e=>(e.textContent||'').trim()).filter(Boolean).slice(0,4),
      sendDisabled: (()=>{const s=[...document.querySelectorAll('button[aria-label="Send"]')].pop(); return s?s.disabled:null;})(),
      n: document.querySelectorAll('[data-message-id]').length};
  }, t);
  // remove the mp4 chip
  try { await page.locator('button[aria-label="Remove attachment"]').first().click({timeout:6000}); await page.waitForTimeout(1200); } catch(e){ out.rmErr=String(e).slice(0,60); }
  out.cleared = await state('cleared');
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-huge.png`);
  await page.waitForTimeout(9000);
  out.afterHuge = await state('after-huge-80MB');
  return out;
};
