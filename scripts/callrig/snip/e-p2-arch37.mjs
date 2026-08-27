import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    // leaf-ish nodes whose OWN text is a filename
    const leaves=[...document.querySelectorAll('*')].filter(e=>vis(e)
      && e.children.length===0 && /\.(txt|png|pdf|jpg|y4m|wav|zip|mp4|mp3)$/i.test((e.textContent||'').trim()));
    const first=leaves[0];
    const row = first && first.closest('[role=row],tr,li') || (first&&first.parentElement&&first.parentElement.parentElement);
    return {
      fileNames: leaves.map(e=>e.textContent.trim().slice(0,40)).slice(0,15),
      firstRowTag: row? row.tagName+' '+(row.getAttribute('role')||'') : 'none',
      rowControls: row? [...row.querySelectorAll('button,a')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,34)) : []
    };
  });
};
