/* What does the meeting itself say about approval / lobby? */
import { callIdOf } from './a-callkit.mjs';
export default async ({ page }) => {
  const id = callIdOf(page);
  if (!id) return { err: 'host is not in a call', url: page.url() };
  return page.evaluate(async (mid) => {
    const j = async (u) => {
      try { const r = await fetch(u, { credentials: 'include' });
            return { s: r.status, b: await r.json().catch(() => null) }; }
      catch (e) { return { err: String(e) }; }
    };
    const m = await j(`/api/v1/meeting/${mid}`);
    const p = await j(`/api/v1/meeting/${mid}/participants`);
    return {
      meeting: m.s === 200 ? m.b : m,
      participants: p.s === 200 && Array.isArray(p.b?.participants ?? p.b)
        ? (p.b.participants ?? p.b).map((x) => ({
            name: x.display_name || x.name, status: x.status,
            role: x.role, is_guest: x.is_guest }))
        : p,
    };
  }, id);
};
