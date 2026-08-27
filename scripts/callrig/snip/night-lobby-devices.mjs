export default async ({page}) => page.evaluate(()=>{
  const m=document.querySelector('main')||document.body;
  return {selects:[...m.querySelectorAll('select')].map(s=>({
            opts:[...s.options].map(o=>o.text.slice(0,28)), sel:s.selectedIndex, name:s.getAttribute('aria-label')})),
          combos:[...m.querySelectorAll('[role="combobox"],[aria-haspopup]')].map(e=>({
            tag:e.tagName.toLowerCase(), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
            expanded:e.getAttribute('aria-expanded')})),
          textAround:(()=>{const t=m.innerText;const i=t.indexOf('DEVICE CHECK');return t.slice(i,i+220).replace(/\n+/g,' | ');})()};
});
