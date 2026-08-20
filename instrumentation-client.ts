import { vemetric } from "@vemetric/web";

// Runs on the client before anything else. Page views track automatically.
// No-ops without a token; Vemetric also ignores localhost, so this only lights up on Vercel.
const token = process.env.NEXT_PUBLIC_VEMETRIC_TOKEN;
if (token) vemetric.init({ token });
