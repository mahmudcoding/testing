export default async ({page}) => {
  const V=`(e => {const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1; while(n){const cs=getComputedStyle(n); o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden')return false; n=n.parentElement;} return o>0.05;})`;
  const dlg = page.locator('[role=dialog]').last();
  const name = dlg.locator('input[placeholder="project-alpha"]').first();
  const probe = async (val) => {
    await name.fill(''); await page.waitForTimeout(200);
    await name.type(val); await page.waitForTimeout(900);
    return await page.evaluate(v=>{const vv=eval(v);
      const d=[...document.querySelectorAll('[role=dialog]')].filter(vv)[0];
      const i=d.querySelector('input[placeholder="project-alpha"]');
      const create=[...d.querySelectorAll('button')].find(b=>/^Create$/.test((b.innerText||'').trim()));
      return {typed:i.value, createDisabled:create?create.disabled:null,
        hint:[...d.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
          .map(e=>e.textContent.trim()).filter(t=>/[a-z]/i.test(t)&&t.length<90).slice(-6)};}, V);
  };
  const cases={};
  for(const [k,v] of [['spaces+caps','QA C Test Channel'],['punct','QA/C\\Test?Chan'],['leading spaces','   padded-name   '],['emoji','qa-c-😀-chan']]){
    cases[k]=await probe(v);
  }
  return cases;
};
