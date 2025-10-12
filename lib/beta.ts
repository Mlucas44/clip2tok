export function isAllowedOpenId(openId?: string | null) {
  const list = (process.env.BETA_WHITELIST_OPEN_IDS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
  if (!list.length) return true; // pas de gating si var vide
  return !!openId && list.includes(openId);
}
