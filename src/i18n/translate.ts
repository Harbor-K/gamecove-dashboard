import { KO as KO_BASE } from "./ko";
import { KO_TRACKING } from "./ko-tracking";
import { LOCALE } from "./locale";

const KO: Record<string, string> = { ...KO_BASE, ...KO_TRACKING };

// Korean for strings built at runtime (counts, names, sentences with numbers).
const tx = (s: string) => KO[s] ?? fromPattern(s) ?? s;
const list = (s: string) => s.split(" · ").map(tx).join(" · ");
const month: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };

const PATTERNS: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})$/, (m) => `${month[m[1]]}월 ${m[2]}일`],
  [/^(\d+) projects?$/, (m) => `프로젝트 ${m[1]}개`],
  [/^(\d+) members?$/, (m) => `멤버 ${m[1]}명`],
  [/^Step (\d+) of (\d+)$/, (m) => `단계 ${m[1]}/${m[2]}`],
  [/^(\d+) of (\d+)$/, (m) => `${m[1]} / ${m[2]}`],
  [/^(\d+) of (\d+) nodes confirmed$/, (m) => `노드 ${m[2]}개 중 ${m[1]}개 확인됨`],
  [/^(\d+) \/ (\d+) reviewed$/, (m) => `${m[1]} / ${m[2]} 검토됨`],
  [/^Confirm (\d+) nodes$/, (m) => `노드 ${m[1]}개 확인`],
  [/^Confirm (.+)$/, (m) => `${tx(m[1])} 확인하기`],
  [/^Resolve (.+)$/, (m) => `${tx(m[1])} 해결하기`],
  [/^(\d+) nodes confirmed( · (\d+) kept pending)?\. Nothing is saved until you click Save map, and your game script stays unchanged\.$/, (m) =>
    `노드 ${m[1]}개 확인됨${m[3] ? ` · ${m[3]}개 대기` : ""}. 지도 저장을 누르기 전에는 아무것도 저장되지 않고, 게임 스크립트도 바뀌지 않아요.`],
  [/^(\d+) confirmed( · (\d+) kept pending)?$/, (m) => `${m[1]}개 확인됨${m[3] ? ` · ${m[3]}개 대기` : ""}`],
  [/^(.+) context$/, (m) => `${tx(m[1])} 맥락`],
  [/^(.+) Entry: (.+)$/, (m) => `${tx(m[1])} 진입: ${tx(m[2])}`],
  [/^Remove (.+)$/, (m) => `${tx(m[1])} 삭제`],
  [/^Analysis: (.+)$/, (m) => `분석: ${tx(m[1])}`],
  [/^Track (.+)$/, (m) => `${tx(m[1])} 추적`],
  [/^Keep (.+) pending$/, (m) => `${tx(m[1])} 대기로 두기`],
  [/^Uses context for (.+)\.$/, (m) => `${list(m[1])}의 맥락을 사용해요.`],
  [/^Records (.+)\.$/, (m) => `${m[1]}을(를) 기록해요.`],
  [/^Needed for (.+)\.$/, (m) => `${list(m[1])}에 필요해요.`],
  [/^(\d+) players$/, (m) => `${m[1]}명`],
  // Dashboard values (repo ko units: 명 · 세션 · 분 · 시간)
  [/^([\d.,]+) users$/, (m) => `${m[1]}명`],
  [/^([\d.,]+) active users$/, (m) => `활성 유저 ${m[1]}명`],
  [/^(\d+) of (\d+) users$/, (m) => `${m[2]}명 중 ${m[1]}명`],
  [/^([\d.,]+) sessions$/, (m) => `${m[1]} 세션`],
  [/^([\d.]+) min$/, (m) => `${m[1]}분`],
  [/^([\d.]+) h$/, (m) => `${m[1]}시간`],
  [/^(\d+)h (\d+)m$/, (m) => `${m[1]}시간 ${m[2]}분`],
  [/^(\d+)m (\d+)s$/, (m) => `${m[1]}분 ${m[2]}초`],
  [/^The stage ends when (.+) reports completion\.$/, (m) => `${m[1]}이(가) 완료를 알리면 스테이지가 끝나요.`],
  [/^Stage (\d) entered$/, (m) => `스테이지 ${m[1]} 진입`],
  [/^Why do players drop at (.+)\?$/, (m) => `플레이어는 왜 ${tx(m[1])}에서 이탈하나요?`],
  [/^(.+) has the highest exit rate at ([\d.]+)% of sessions, followed by (.+) at ([\d.]+)%\.$/, (m) =>
    `${tx(m[1])}의 이탈률이 세션의 ${m[2]}%로 가장 높고, 그다음은 ${tx(m[3])} ${m[4]}%예요.`],
  [/^The biggest drop-off is at (.+): ([\d.]+)% of players who reached the previous step stop here \((\d+) players reach it\)\.$/, (m) =>
    `가장 큰 이탈은 ${tx(m[1])} 단계예요. 이전 단계에 도달한 플레이어의 ${m[2]}%가 여기서 멈춰요 (${m[3]}명 도달).`],
  [/^The (.+) cohort has the best Day 1 retention at ([\d.]+)%\.$/, (m) => `${tx(m[1])} 집단의 1일 유지율이 ${m[2]}%로 가장 높아요.`],
  [/^Daily active users moved from (\d+) to (\d+) over the period, averaging (\d+)\.$/, (m) =>
    `기간 동안 일일 활성 플레이어가 ${m[1]}명에서 ${m[2]}명으로 바뀌었고, 평균은 ${m[3]}명이에요.`],
];

function fromPattern(core: string): string | null {
  for (const [re, fn] of PATTERNS) {
    const m = core.match(re);
    if (m) {
      const out = fn(m);
      if (out !== core) return out;
    }
  }
  return null;
}

/** Korean for an English string (keeps surrounding spaces); null when there is none. */
export function translate(src: string): string | null {
  const core = src.trim();
  if (!core) return null;
  const hit = KO[core] ?? fromPattern(core);
  if (hit == null) return null;
  const lead = src.slice(0, src.indexOf(core));
  const trail = src.slice(src.indexOf(core) + core.length);
  return lead + hit + trail;
}

/** For values React puts into inputs/textareas (the DOM translator can't touch those). */
export function tr(src: string): string {
  return LOCALE === "ko" ? translate(src) ?? src : src;
}

// ── DOM translation ─────────────────────────────────────────────────────────────────────────
// Screens are written in English; when Korean is on, every rendered text node and
// placeholder / aria-label / title is swapped for its Korean string. Only nodeValue and
// attributes change — React keeps its own nodes, so layout and behaviour stay identical.

const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "PRE", "CODE"]);
const ATTRS = ["placeholder", "aria-label", "title"];
const original = new WeakMap<Text, string>();
const written = new WeakMap<Text, string>();
const attrState = new WeakMap<Element, Record<string, { original: string; written: string }>>();

function sourceOf(node: Text) {
  const v = node.nodeValue ?? "";
  if (written.get(node) !== v) original.set(node, v);
  return original.get(node) ?? v;
}

function write(node: Text, value: string) {
  written.set(node, value);
  if (node.nodeValue !== value) node.nodeValue = value;
}

function translateRun(nodes: Text[]) {
  const sources = nodes.map(sourceOf);
  if (nodes.length > 1) {
    const joined = translate(sources.join(""));
    if (joined != null) {
      write(nodes[0], joined);
      nodes.slice(1).forEach((n) => write(n, ""));
      return;
    }
  }
  nodes.forEach((n, i) => write(n, translate(sources[i]) ?? sources[i]));
}

function optedOut(el: Element) {
  return el.closest("[data-no-translate]") !== null;
}

function translateAttrs(el: Element) {
  for (const name of ATTRS) {
    const v = el.getAttribute(name);
    if (v == null) continue;
    const state = attrState.get(el) ?? {};
    const entry = state[name];
    const src = entry && entry.written === v ? entry.original : v;
    const out = translate(src) ?? src;
    state[name] = { original: src, written: out };
    attrState.set(el, state);
    if (v !== out) el.setAttribute(name, out);
  }
}

function translateElement(el: Element) {
  if (optedOut(el)) return;
  translateAttrs(el);
  if (SKIP.has(el.tagName)) return;
  let run: Text[] = [];
  const flush = () => {
    if (run.length) translateRun(run);
    run = [];
  };
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) run.push(child as Text);
    else flush();
  });
  flush();
}

function translateTree(root: Node) {
  if (root.nodeType === Node.TEXT_NODE) {
    if (root.parentElement) translateElement(root.parentElement);
    return;
  }
  if (!(root instanceof Element) || optedOut(root)) return;
  translateElement(root);
  root.querySelectorAll("*").forEach((el) => translateElement(el));
}

export function startDomTranslation() {
  if (LOCALE !== "ko" || typeof document === "undefined") return;
  document.documentElement.lang = "ko";
  const run = () => translateTree(document.body);
  const observer = new MutationObserver((mutations) => {
    const targets = new Set<Node>();
    for (const m of mutations) {
      if (m.type === "childList") {
        targets.add(m.target);
        m.addedNodes.forEach((n) => targets.add(n));
      } else if (m.type === "characterData") {
        if (m.target.parentElement) targets.add(m.target.parentElement);
      } else if (m.type === "attributes" && m.target instanceof Element) {
        translateAttrs(m.target);
      }
    }
    targets.forEach((t) => {
      if (t instanceof Element) translateElement(t);
      if (t.nodeType !== Node.TEXT_NODE && t !== document.body) translateTree(t);
    });
  });
  const begin = () => {
    run();
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  };
  if (document.body) begin();
  else document.addEventListener("DOMContentLoaded", begin, { once: true });
}
