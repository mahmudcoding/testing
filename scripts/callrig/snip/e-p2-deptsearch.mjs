import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const search = async q => {
    await page.evaluate(`(() => { ${VISFN}
      const i=[...document.querySelectorAll('input[type=search]')].filter(vis)[0];
      const p=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      p.call(i,''); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await page.waitForTimeout(900);
    await page.evaluate(`(() => { ${VISFN}
      const i=[...document.querySelectorAll('input[type=search]')].filter(vis)[0];
      const p=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      p.call(i,${JSON.stringify(q)}); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await page.waitForTimeout(2600);
    return await page.evaluate(`(() => { ${VISFN}
      const m=document.querySelector('main');
      const rows=[...m.querySelectorAll('[class*=truncate]')].filter(vis)
        .map(n=>(n.textContent||'').trim()).filter(t=>/^QA /.test(t));
      return { hits:[...new Set(rows)].slice(0,8),
               text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,150) }; })()`);
  };
  out.byDepartment = await search('Quality');
  out.byJobTitle   = await search('QA Engineer');
  out.byName       = await search('Alice');
  out.byUsername   = await search('qa_e_alice');
  return out;
};
