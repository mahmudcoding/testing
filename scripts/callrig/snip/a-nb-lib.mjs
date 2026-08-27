// Session-local helpers for lane A, sector A (calls-inside), 2026-08-26 night box.
export const WS = 'W4QAF1XTURESO01';
export const WS_PLACEHOLDER = 1;
export const SHOTS = '/private/tmp/claude-501/-Users-mahmud-Projects-testing/af3dd37d-d7d6-4579-b0d6-c99cb7891e32/scratchpad/shots';

// visible = non-zero rect AND opacity product up the ancestor chain
export const VIS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;
  let n=el,op=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);
  if(s.visibility==='hidden'||s.display==='none')return false;op*=parseFloat(s.opacity||'1');n=n.parentElement;}
  return op>0.05;}`;

// Enumerate every interactive node in the call overlay (or given root), visible only.
export const SNAP = `(vs, sel) => { const vis = eval(vs);
  const root = (sel && document.querySelector(sel))
    || document.querySelector('[data-testid="call-overlay-expanded"]')
    || [...document.querySelectorAll('[role="dialog"]')].filter(vis).pop()
    || document.querySelector('main') || document.body;
  const inter = [...root.querySelectorAll('button,a,[role="button"],[role="menuitem"],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
    .filter(vis)
    .map(b => ({ l:(b.getAttribute('aria-label')||b.innerText||b.value||'').trim().replace(/\\s+/g,' ').slice(0,48),
                 t:b.getAttribute('data-testid')||null, p:b.getAttribute('aria-pressed'),
                 d:b.disabled===true||b.getAttribute('aria-disabled')==='true'||null,
                 tag:b.tagName.toLowerCase() }))
    .filter(x => x.l || x.t);
  return { url: location.pathname,
    root: root.getAttribute('data-testid') || root.tagName.toLowerCase(),
    txt: (root.innerText||'').replace(/\\s+/g,' ').slice(0,900),
    inter };
}`;

// Every visible toast / status region, selected by visibility not by role alone.
export const TOASTS = `(vs) => { const vis = eval(vs);
  return [...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"],[class*="toast"],[class*="Toast"],[class*="notification"],[class*="snack"]')]
    .filter(vis)
    .map(n => { const r = n.getBoundingClientRect();
      return { txt:(n.innerText||'').replace(/\\s+/g,' ').slice(0,220),
               cls:(n.className&&n.className.baseVal!==undefined?n.className.baseVal:String(n.className||'')).slice(0,60),
               role:n.getAttribute('role'), w:Math.round(r.width), h:Math.round(r.height), y:Math.round(r.top) }; })
    .filter(t => t.txt && t.w > 8 && t.h > 8); }`;
