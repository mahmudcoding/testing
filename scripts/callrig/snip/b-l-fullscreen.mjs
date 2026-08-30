/* sector L: fullscreen enter/exit */
import { DOM } from './lib.mjs';
const st = async (page) => page.evaluate(()=>{
  const q=window.__qa;
  const b=document.querySelector('[data-testid="call-surface-fullscreen"]');
  const surf=document.querySelector('[data-testid="call-surface"]');
  return {btn:b?{n:q.nameOf(b).trim(), p:b.getAttribute('aria-pressed'), d:b.disabled}:null,
    fsEl: document.fullscreenElement?document.fullscreenElement.tagName+'/'+(document.fullscreenElement.getAttribute('data-testid')||''):null,
    innerW:window.innerWidth, innerH:window.innerHeight,
    surfRect: surf?(r=>({w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top)}))(surf.getBoundingClientRect()):null,
    tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].map(n=>{const r=n.getBoundingClientRect();
      return Math.round(r.width)+'x'+Math.round(r.height);}),
    toolbarVis: (()=>{const t=document.querySelector('[data-testid="call-toolbar"]'); return t?q.boxVis(t):null;})(),
    navVis: (()=>{const n=document.querySelector('[data-testid="app-shell-nav"]'); return n?q.boxVis(n):null;})()};
});
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.a = await st(page);
  out.click1 = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-surface-fullscreen"]'); if(!b) return {ok:false}; b.click(); return {ok:true};});
  await page.waitForTimeout(2500);
  out.b_fs = await st(page);
  await page.waitForTimeout(2500);
  out.c_fs2 = await st(page);
  out.click2 = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-surface-fullscreen"]'); if(!b) return {ok:false}; b.click(); return {ok:true};});
  await page.waitForTimeout(2500);
  out.d_exit = await st(page);
  // and the Escape route out of fullscreen
  out.click3 = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-surface-fullscreen"]'); if(!b) return {ok:false}; b.click(); return {ok:true};});
  await page.waitForTimeout(2200);
  out.e_fs = await st(page);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2200);
  out.f_afterEsc = await st(page);
  return out;
};
