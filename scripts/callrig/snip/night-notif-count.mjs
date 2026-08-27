export default async ({page}) => page.evaluate(()=>{
  const b=[...document.querySelectorAll('button')].find(x=>/^Notifications/.test(x.getAttribute('aria-label')||''));
  return {label: b?b.getAttribute('aria-label'):null};
});
