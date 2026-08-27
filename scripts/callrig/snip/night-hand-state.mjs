export default async ({page}) => page.evaluate(()=>{
  const btn=[...document.querySelectorAll('button')]
    .find(b=>/hand/i.test(b.getAttribute('aria-label')||''));
  const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')].map(t=>{
    const n=t.querySelector('[data-testid="participant-name"]');
    return {name:n?n.innerText.trim():'?',
      handMarks:[...t.querySelectorAll('[data-testid],[aria-label],[title]')]
        .map(e=>e.getAttribute('data-testid')||e.getAttribute('aria-label')||e.getAttribute('title'))
        .filter(x=>x&&/hand|raise/i.test(x)).slice(0,2)};});
  const panel=document.querySelector('[data-testid="participants-list-panel"]');
  return {ownButton: btn?{l:btn.getAttribute('aria-label'), pressed:btn.getAttribute('aria-pressed')}:null,
    tiles, panelText: panel?panel.innerText.replace(/\n+/g,' | ').slice(0,180):null,
    bodyHandText:(()=>{const m=document.body.innerText.match(/[^\n]*(raised|Raised|hand)[^\n]*/);return m?m[0].trim().slice(0,60):null;})()};
});
