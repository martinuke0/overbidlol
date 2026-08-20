// Simulate a paid bid against the running dev server (no Polar, no charge).
// Usage: npm run simulate -- <url-or-@handle> <dollars> ["Title"] ["Description"]
// Example: npm run simulate -- trycodus.com 5 "Codus" "Autonomous agents per person."
const [target, dollarsArg, title, description] = process.argv.slice(2);
if (!target || !dollarsArg) {
  console.error('Usage: npm run simulate -- <url-or-@handle> <dollars> ["Title"] ["Description"]');
  process.exit(1);
}

const isHandle = target.startsWith("@") || (!target.includes(".") && !target.includes("/"));
const body = {
  amount_dollars: Number(dollarsArg),
  title,
  description,
  ...(isHandle ? { handle: target } : { url: /^https?:\/\//i.test(target) ? target : `https://${target}` }),
};

const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const res = await fetch(`${base}/api/dev/simulate`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
const data = await res.json();
console.log(res.ok ? "✓ applied:" : "✗ error:", data);
process.exit(res.ok ? 0 : 1);
