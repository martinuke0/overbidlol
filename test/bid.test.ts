import { test } from "node:test";
import assert from "node:assert/strict";
import { computePayCents, toTakeRankCents } from "../lib/bid";
import { parseIdentity } from "../lib/identity";

test("new listing pays the full target", () => {
  assert.equal(computePayCents(5000, null), 5000);
});

test("empty board: #1 costs $1", () => {
  assert.equal(computePayCents(100, null), 100);
});

test("below minimum is rejected", () => {
  assert.throws(() => computePayCents(50, null), /Minimum bid/);
});

test("upbid pays only the difference", () => {
  assert.equal(computePayCents(10000, 4000), 6000);
});

test("cannot upbid to the same or lower amount", () => {
  assert.throws(() => computePayCents(4000, 4000), /beat your current/);
  assert.throws(() => computePayCents(3000, 4000), /beat your current/);
});

test("a low bid on a rich board is still valid (fills the screenshot)", () => {
  // $40 target with no existing listing → pays $40, lands wherever it lands.
  assert.equal(computePayCents(4000, null), 4000);
});

test("claim-this-rank helper is one $0.25 step up", () => {
  assert.equal(toTakeRankCents(4000), 4025);
});

test("upbid by one quarter pays 25 cents", () => {
  assert.equal(computePayCents(225, 200), 25);
});

test("URL identity strips www, tracking params, trailing slash", () => {
  const id = parseIdentity({ url: "https://www.Example.com/app/?utm_source=x&ref=y", utmSource: "overbid" });
  assert.equal(id.kind, "url");
  assert.equal(id.key, "https://example.com/app");
  assert.match(id.url, /utm_source=overbid/);
});

test("store paths do not collapse into one bid", () => {
  const a = parseIdentity({ url: "https://apps.apple.com/app/id123", utmSource: "overbid" });
  const b = parseIdentity({ url: "https://apps.apple.com/app/id456", utmSource: "overbid" });
  assert.notEqual(a.key, b.key);
});

test("handle normalizes and points at x.com", () => {
  const id = parseIdentity({ handle: "Jonathan", utmSource: "overbid" });
  assert.equal(id.key, "@jonathan");
  assert.match(id.url, /x\.com\/jonathan/);
});

test("chat-invite links are blocked", () => {
  assert.throws(() => parseIdentity({ url: "https://t.me/foo", utmSource: "overbid" }), /Chat and invite/);
});

test("NSFW / adult links are blocked (bare and www)", () => {
  assert.throws(() => parseIdentity({ url: "https://pornhub.com/x", utmSource: "overbid" }), /Adult/);
  assert.throws(() => parseIdentity({ url: "https://www.onlyfans.com/x", utmSource: "overbid" }), /Adult/);
});
