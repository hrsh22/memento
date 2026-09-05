"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Database,
  Download,
  ExternalLink,
  FileText,
  Fingerprint,
  FlaskConical,
  Code2,
  Layers,
  LoaderCircle,
  LockKeyhole,
  Menu,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { planMemories } from "@/lib/agent/engine";
import {
  DEFAULT_POLICY,
  DEMO_BUDGET,
  SEED_MEMORIES,
} from "@/lib/agent/memories";
import type {
  AgentState,
  ChainSnapshot,
  DecisionPlan,
  LiveDecision,
  Memory,
  MemoryDecision,
  Policy,
  Receipt,
} from "@/lib/agent/types";
import { cn } from "@/lib/utils";
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", {
    maximumFractionDigits: d,
    minimumFractionDigits: d,
  });
const short = (s: string) => s.slice(0, 6) + "…" + s.slice(-4);
const size = (n: number) => (n < 1024 ? `${n} B` : `${fmt(n / 1024, 1)} KB`);
const explorer = "https://filecoin-testnet.blockscout.com";
/** One plain sentence for a reader who does not know what a payment rail is. */
function plainly(decision: LiveDecision): string {
  const reason = decision.headline;
  if (decision.verdict === "store")
    return reason.startsWith("Existing funds")
      ? "In plain terms: the money already set aside covers this, so the agent keeps the selected memories without asking for more."
      : "In plain terms: this fits the monthly allowance, so the agent moves its own funds into the reserve and stores.";
  if (reason.includes("recurring cost"))
    return "In plain terms: the wallet has money, but keeping this data every month would cost more than the agent is allowed to spend. It declined rather than overcommit.";
  if (reason.includes("top-up limit"))
    return "In plain terms: this would need a bigger one-time deposit than the agent may make on its own, so it stopped and left the call to a human.";
  if (reason.includes("fund the reserve"))
    return "In plain terms: the wallet does not hold enough to cover the reserve this write requires, so the agent declined instead of failing halfway.";
  if (reason.includes("test FIL"))
    return "In plain terms: there is no gas left to pay for the transaction itself, so the agent stopped before it could get stuck.";
  if (reason.includes("operation-fee"))
    return "In plain terms: the agent has already spent its fee allowance for the last 30 days. It waits rather than quietly exceeding its own budget.";
  if (reason.includes("reserve-funding"))
    return "In plain terms: the agent has already topped itself up as much as it is allowed to this month, so it defers.";
  return "In plain terms: a spending limit was not satisfied, so the agent declined the write.";
}
const navigation = [
  { id: "overview", name: "Overview", icon: Layers },
  { id: "memories", name: "Memory vault", icon: Database },
  { id: "receipts", name: "Decision receipts", icon: Fingerprint },
  { id: "policy", name: "Agent policy", icon: Settings2 },
] as const;
type View = (typeof navigation)[number]["id"];
function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={cn("brand", small && "small")}>
      <div className="brand-mark">
        <span />
        <span />
        <span />
        <span />
      </div>
      {!small && (
        <span>
          memento<span className="brand-dot">.</span>
        </span>
      )}
    </div>
  );
}
function MemorySculpture() {
  return (
    <div className="sculpture" aria-hidden="true">
      <svg viewBox="0 0 330 240" fill="none">
        <defs>
          <pattern
            id="dots"
            width="15"
            height="15"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r=".75" fill="#4a5344" opacity=".35" />
          </pattern>
          <linearGradient
            id="cube-top"
            x1="90"
            y1="20"
            x2="240"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E6F3AC" />
            <stop offset="1" stopColor="#BBCB80" />
          </linearGradient>
        </defs>
        <rect width="330" height="240" fill="url(#dots)" />
        <ellipse
          cx="165"
          cy="201"
          rx="112"
          ry="25"
          fill="#101710"
          opacity=".28"
        />
        <g className="layer layer-bottom">
          <path
            d="M68 145 165 93 262 145 165 198Z"
            fill="#687958"
            stroke="#A1B282"
          />
          <path d="M68 145V159L165 213V198Z" fill="#3F503B" stroke="#82936C" />
          <path
            d="M165 198 262 145V159L165 213Z"
            fill="#4F6246"
            stroke="#82936C"
          />
        </g>
        <g className="layer layer-middle">
          <path
            d="M68 105 165 53 262 105 165 158Z"
            fill="#9AAA77"
            stroke="#C4D397"
          />
          <path d="M68 105V120L165 174V158Z" fill="#60734E" stroke="#A3B57E" />
          <path
            d="M165 158 262 105V120L165 174Z"
            fill="#819361"
            stroke="#A3B57E"
          />
          <path
            d="m90 108 74-39 73 39-73 40Z"
            stroke="#D8E3B5"
            strokeDasharray="3 4"
          />
        </g>
        <g className="layer layer-top">
          <path
            d="M68 66 165 14 262 66 165 119Z"
            fill="url(#cube-top)"
            stroke="#EAF5C9"
          />
          <path d="M68 66V81L165 135V119Z" fill="#90A56A" stroke="#D2E2A5" />
          <path
            d="M165 119 262 66V81L165 135Z"
            fill="#BACD8C"
            stroke="#DFEAB9"
          />
          <path d="m133 66 31-17 32 17-32 18Z" fill="#263728" />
          <path d="m145 64 18-10 19 10-19 10Z" fill="#DDEDAA" />
          <path
            d="m90 66 75-40 75 40-75 41Z"
            stroke="#778D54"
            strokeOpacity=".5"
          />
        </g>
        <path
          d="M48 64H17V105M281 145H311V106"
          stroke="#99AC80"
          strokeWidth="1"
        />
        <circle cx="17" cy="109" r="3" fill="#C1E77B" />
        <circle cx="311" cy="102" r="3" fill="#C1E77B" />
      </svg>
      <span className="sculpture-label label-left">USEFUL KNOWLEDGE</span>
      <span className="sculpture-label label-right">
        <span className="status-dot" /> CORE PROTECTED
      </span>
    </div>
  );
}
function RunwayChart({ plan }: { plan: DecisionPlan }) {
  const end = Math.max(
    plan.plannedRunwayDays ?? 50,
    plan.baselineRunwayDays ?? 50,
    30,
  );
  const good = Math.min(
    440,
    55 + ((plan.plannedRunwayDays ?? end) / end) * 380,
  );
  const bad = Math.min(
    440,
    55 + ((plan.baselineRunwayDays ?? end) / end) * 380,
  );
  return (
    <svg
      className="runway-chart"
      viewBox="0 0 480 140"
      role="img"
      aria-label={`Estimated runway: store everything ${fmt(plan.baselineRunwayDays ?? 0, 1)} days; Memento ${fmt(plan.plannedRunwayDays ?? 0, 1)} days`}
    >
      <defs>
        <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a8bb79" stopOpacity=".28" />
          <stop offset="1" stopColor="#a8bb79" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[30, 65, 100].map((y) => (
        <line
          key={y}
          x1="0"
          x2="480"
          y1={y}
          y2={y}
          stroke="#e5e6de"
          strokeDasharray="3 4"
        />
      ))}
      <path
        d={`M5 17 C60 22 ${good * 0.5} 43 ${good} 108 L${good} 112H5Z`}
        fill="url(#chart-fill)"
      />
      <path
        d={`M5 17 C60 22 ${good * 0.5} 43 ${good} 108`}
        stroke="#64823e"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d={`M5 35 C60 41 ${bad * 0.5} 78 ${bad} 108`}
        stroke="#b5b9ae"
        strokeWidth="1.5"
        strokeDasharray="5 5"
        fill="none"
      />
      <circle
        cx={good}
        cy="108"
        r="4"
        fill="#64823e"
        stroke="white"
        strokeWidth="2"
      />
      <text x="5" y="134">
        NOW
      </text>
      <text x="218" y="134">
        {Math.round(end / 2)} DAYS
      </text>
      <text x="425" y="134">
        {Math.round(end)} DAYS
      </text>
    </svg>
  );
}
function StageFeed({
  step,
  plan,
  running,
}: {
  step: number;
  plan: DecisionPlan;
  running: boolean;
}) {
  const stages = [
    {
      title: "Observe the treasury",
      detail: "Read balance, current spend, and reserve runway.",
    },
    {
      title: "Decide what matters",
      detail: `Protect ${plan.protectedCount} core memories. Defer ${plan.deferredCount} low-value items.`,
    },
    {
      title: "Act within the budget",
      detail: `Bundle ${plan.decisions.length - plan.deferredCount} useful memories into one archive.`,
    },
    {
      title: "Leave a verifiable trail",
      detail: "Record the policy, alternatives, and source hashes.",
    },
  ];
  return (
    <div className="stage-feed">
      {stages.map((s, i) => (
        <div
          className={cn(
            "stage",
            step >= i && "complete",
            running && step === i && "current",
          )}
          key={s.title}
        >
          <div className="stage-icon">
            {step > i || (!running && step === 3) ? (
              <Check size={13} />
            ) : running && step === i ? (
              <LoaderCircle size={13} className="spin" />
            ) : (
              <span>{String(i + 1).padStart(2, "0")}</span>
            )}
          </div>
          <div>
            <div className="stage-name">
              {s.title}
              {running && step === i && <span>NOW</span>}
            </div>
            <p>{s.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
export function Memento({
  evidence = false,
  live = false,
}: {
  evidence?: boolean;
  live?: boolean;
}) {
  const [view, setView] = useState<View>(evidence ? "receipts" : "overview");
  const [mode, setMode] = useState<"lab" | "live">(
    evidence || live ? "live" : "lab",
  );
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY);
  const [memories, setMemories] = useState<Memory[]>(SEED_MEMORIES);
  const [balance, setBalance] = useState(0.25);
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [selected, setSelected] = useState<MemoryDecision | null>(null);
  const [help, setHelp] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: "Research agent",
    workspace: "Personal workspace",
  });
  const [add, setAdd] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobile, setMobile] = useState(false);
  const [chain, setChain] = useState<ChainSnapshot | null>(null);
  const [agent, setAgent] = useState<AgentState>({
    running: false,
    events: [],
    receipts: [],
  });
  const [chainError, setChainError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newImportance, setNewImportance] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [verification, setVerification] = useState<{
    verified: boolean;
    signatureValid: boolean;
    hashMatches: boolean;
    decisionSignatureValid?: boolean | null;
    onchainConfirmed: boolean;
    retrievalCopies?: {
      providerId: string;
      bytes: number;
      hashMatches: boolean;
    }[];
    bytes: number;
    checkedAt: string;
    onchainCopies: {
      providerId: string;
      dataSetId: string;
      live: boolean;
      pieceIncluded: boolean;
      nextChallengeEpoch: string | null;
    }[];
  } | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [deciding, setDeciding] = useState(false);
  const [liveCap, setLiveCap] = useState(DEFAULT_POLICY.maxMonthlyUsdfc);
  const [liveDecision, setLiveDecision] = useState<LiveDecision | null>(null);
  const [decideError, setDecideError] = useState("");
  const refreshing = useRef(false);
  const receiptTitle = useRef<HTMLHeadingElement>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [labReceipts, setLabReceipts] = useState<
    { at: string; plan: DecisionPlan }[]
  >([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const plan = useMemo(
    () =>
      planMemories(
        memories,
        { ...DEMO_BUDGET, availableUsdfc: balance },
        policy,
      ),
    [memories, balance, policy],
  );
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setLoading(true);
    const [c, a] = await Promise.allSettled([
      fetch("/api/chain", { cache: "no-store" }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        return data;
      }),
      fetch("/api/agent", { cache: "no-store" }).then(async (r) => {
        if (!r.ok) throw new Error("Evidence unavailable");
        return r.json();
      }),
    ]);
    if (c.status === "fulfilled") {
      setChain(c.value);
      setChainError("");
    } else {
      setChainError(
        c.reason instanceof Error
          ? c.reason.message
          : "Calibration is unavailable.",
      );
    }
    if (a.status === "fulfilled") setAgent(a.value);
    refreshing.current = false;
    setLoading(false);
  }, []);
  async function verify(id: string) {
    setVerifying(true);
    setVerifyError("");
    setVerification(null);
    try {
      const r = await fetch("/api/verify?id=" + encodeURIComponent(id));
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setVerification(data);
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setVerifying(false);
    }
  }
  async function decide(cap: number) {
    setDeciding(true);
    setDecideError("");
    setLiveDecision(null);
    try {
      const r = await fetch("/api/decide?cap=" + encodeURIComponent(cap), {
        cache: "no-store",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setLiveDecision(data);
    } catch (e) {
      setDecideError(
        e instanceof Error ? e.message : "The live decision could not run.",
      );
    } finally {
      setDeciding(false);
    }
  }
  useEffect(() => {
    const pending = timers.current;
    const start = setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      clearTimeout(start);
      pending.forEach(clearTimeout);
    };
  }, [refresh]);
  useEffect(() => {
    if (mode !== "live") return;
    const initial = setTimeout(() => {
      void refresh();
    }, 0);
    const timer = setInterval(() => {
      void refresh();
    }, 15000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [mode, refresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  function run() {
    if (running) return;
    setRunning(true);
    setStep(0);
    setHasRun(false);
    for (let i = 1; i < 4; i++)
      timers.current.push(setTimeout(() => setStep(i), i * 800));
    timers.current.push(
      setTimeout(() => {
        setRunning(false);
        setHasRun(true);
        setLabReceipts((r) =>
          [{ at: new Date().toISOString(), plan }, ...r].slice(0, 20),
        );
      }, 3300),
    );
  }
  function navigate(next: View) {
    setView(next);
    setMobile(false);
  }
  function download(data: unknown, name: string) {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Receipt exported.");
  }
  const activeDays =
    mode === "live" ? chain?.runwayDays : plan.plannedRunwayDays;
  const shown = plan.decisions.filter(
    (m) =>
      (filter === "all" || m.action === filter) &&
      m.title.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <aside className={cn("sidebar", mobile && "is-open")}>
        <Link href="/" aria-label="Memento introduction">
          <Logo />
        </Link>
        <button
          type="button"
          className="workspace"
          onClick={() => setProfileOpen(true)}
          aria-label={`Edit agent profile: ${profile.name}`}
          aria-haspopup="dialog"
        >
          <div className="workspace-icon">
            <Sparkles size={16} />
          </div>
          <div>
            <strong>{profile.name}</strong>
            <span>{profile.workspace}</span>
          </div>
          <ChevronDown size={14} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map((n) => (
            <button
              key={n.id}
              className={cn("nav-item", view === n.id && "active")}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={18} />
              <span>{n.name}</span>
              {n.id === "receipts" && (
                <span className="nav-count">
                  {agent.receipts.length + labReceipts.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="network-card">
            <span className="network-symbol">⨎</span>
            <div>
              <strong>Built on Filecoin</strong>
              <span>Memory you can verify.</span>
            </div>
            <ArrowUpRight size={15} />
          </div>
          <Link className="nav-item" href="/watch">
            <Play size={18} />
            <span>Watch a real agent run</span>
          </Link>
          <button className="nav-item" onClick={() => setHelp(true)}>
            <CircleHelp size={18} />
            <span>How Memento works</span>
          </button>
          <a
            className="nav-item"
            href="https://github.com/hrsh22/memento"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 size={18} />
            <span>View source</span>
            <ArrowUpRight size={13} />
          </a>
          <div className="profile">
            <div className="avatar">M</div>
            <div>
              <strong>Memento agent</strong>
              <span>Calibration testnet</span>
            </div>
            <span className="status-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={19} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{navigation.find((n) => n.id === view)?.name}</strong>
          </div>
          <div className="topbar-right">
            <span className="testnet">
              <span className="status-dot" /> Calibration
            </span>
            <button
              className="icon-button help-top"
              onClick={() => setHelp(true)}
              aria-label="How it works"
            >
              <CircleHelp size={18} />
            </button>
            <div className="avatar top-avatar">M</div>
          </div>
        </header>
        <main id="main">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="tiny-cross">✳</span> AUTONOMOUS MEMORY TREASURY
              </div>
              <h1>
                {view === "overview"
                  ? "A memory worth keeping."
                  : view === "memories"
                    ? "Remember with intention."
                    : view === "receipts"
                      ? "Every decision, accounted for."
                      : "Your values. Its decisions."}
              </h1>
              <p>
                {view === "overview"
                  ? "Your agent remembers what matters. And knows what it can afford."
                  : view === "memories"
                    ? "A little less noise. A lot more knowledge."
                    : view === "receipts"
                      ? "Inspect the evidence behind what your agent chooses to keep."
                      : "Set the boundaries once. Let the agent handle the trade-offs."}
              </p>
            </div>
            <Button
              className="header-action"
              variant="outline"
              onClick={() => setHelp(true)}
            >
              <BookOpen size={15} /> How it works <ArrowUpRight size={14} />
            </Button>
          </div>
          <div className="mode-row">
            <div
              className="mode-switch"
              role="tablist"
              aria-label="Data source"
            >
              <button
                role="tab"
                aria-selected={mode === "lab"}
                className={cn(mode === "lab" && "selected")}
                onClick={() => setMode("lab")}
              >
                <FlaskConical size={14} /> Decision lab
              </button>
              <button
                role="tab"
                aria-selected={mode === "live"}
                className={cn(mode === "live" && "selected")}
                onClick={() => setMode("live")}
              >
                <Radio size={14} /> Live onchain
              </button>
            </div>
            <span className="mode-note">
              {mode === "lab" ? (
                <>
                  <span className="lab-dot" /> Interactive scenario · no
                  transactions
                </>
              ) : (
                <>
                  <span className="status-dot" />
                  {chain
                    ? `Observed epoch ${Number(chain.epoch).toLocaleString()}`
                    : "Connecting to Calibration"}
                </>
              )}
            </span>
          </div>
          {mode === "live" && (
            <div className={cn("live-banner", chainError && "error-banner")}>
              <div>
                <Radio size={17} />
                <span>
                  {chainError || (
                    <>
                      Real Filecoin Pay telemetry{" "}
                      <span className="muted">/</span>{" "}
                      {chain ? (
                        <a
                          href={`${explorer}/address/${chain.address}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {short(chain.address)} <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <span>Reading account…</span>
                      )}
                    </>
                  )}
                </span>
              </div>
              <button onClick={() => void refresh()} disabled={loading}>
                <RefreshCw size={13} className={cn(loading && "spin")} />
                {loading ? "Reading" : "Refresh"}
              </button>
            </div>
          )}
          {mode === "live" && (
            <section
              className="decide-live"
              aria-labelledby="decide-live-title"
            >
              <div className="decide-head">
                <div className="decide-intro">
                  <span className="section-label">
                    <Play size={14} /> DECIDE NOW
                  </span>
                  <h2 id="decide-live-title">
                    Move the limit. Watch it change its mind.
                  </h2>
                  <p>
                    Reads this wallet’s Filecoin Pay balance, runway, rails, and
                    the onchain price list at the current epoch, then runs the
                    same policy engine and budget gate the funded worker uses.
                    Nothing is broadcast.
                  </p>
                </div>
                <div className="decide-control">
                  <div className="decide-cap">
                    <label htmlFor="live-cap">Monthly spending cap</label>
                    <strong>
                      {fmt(liveCap, 2)} <small>USDFC</small>
                    </strong>
                  </div>
                  <input
                    id="live-cap"
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={liveCap}
                    disabled={deciding}
                    onChange={(e) => {
                      setLiveCap(Number(e.target.value));
                      setLiveDecision(null);
                      setDecideError("");
                    }}
                  />
                  <div className="range-labels">
                    <span>Refuses more</span>
                    <span>Allows more</span>
                  </div>
                  <button
                    type="button"
                    className="decide-run"
                    onClick={() => void decide(liveCap)}
                    disabled={deciding}
                  >
                    {deciding ? (
                      <>
                        <LoaderCircle size={15} className="spin" /> Reading
                        Calibration…
                      </>
                    ) : (
                      <>
                        <Play size={15} /> Run a live decision now
                      </>
                    )}
                  </button>
                </div>
              </div>
              {decideError && (
                <p className="decide-error" role="alert">
                  {decideError}
                </p>
              )}
              {liveDecision && (
                <div className={cn("decide-result", liveDecision.verdict)}>
                  <div className="decide-verdict">
                    {liveDecision.verdict === "store" ? (
                      <ShieldCheck size={20} />
                    ) : (
                      <LockKeyhole size={20} />
                    )}
                    <div>
                      <strong>
                        {liveDecision.verdict === "store"
                          ? "Write approved"
                          : "Write refused"}
                      </strong>
                      <p>{liveDecision.headline}</p>
                      <p className="decide-plain">{plainly(liveDecision)}</p>
                    </div>
                    <span className="decide-epoch">
                      EPOCH{" "}
                      {Number(liveDecision.snapshot.epoch).toLocaleString()}
                    </span>
                  </div>
                  <dl className="decide-numbers">
                    <div>
                      <dt>Runway read onchain</dt>
                      <dd>
                        {liveDecision.snapshot.runwayDays === null
                          ? "Unbounded"
                          : `${fmt(liveDecision.snapshot.runwayDays, 1)} days`}
                      </dd>
                    </div>
                    <div>
                      <dt>Available funds</dt>
                      <dd>
                        {fmt(Number(liveDecision.snapshot.availableFunds), 4)}{" "}
                        USDFC
                      </dd>
                    </div>
                    <div>
                      <dt>Projected recurring</dt>
                      <dd>
                        {fmt(
                          Number(liveDecision.projection.projectedMonthlyUsdfc),
                          4,
                        )}{" "}
                        USDFC
                      </dd>
                    </div>
                    <div>
                      <dt>Against cap</dt>
                      <dd>
                        {fmt(liveDecision.policy.maxMonthlyUsdfc, 2)} USDFC
                      </dd>
                    </div>
                    <div>
                      <dt>Deposit required</dt>
                      <dd>
                        {fmt(
                          Number(liveDecision.projection.depositNeededUsdfc),
                          4,
                        )}{" "}
                        USDFC
                      </dd>
                    </div>
                    <div>
                      <dt>Selected payload</dt>
                      <dd>{size(liveDecision.projection.payloadBytes)}</dd>
                    </div>
                  </dl>
                  <ol className="decide-trace">
                    <li>
                      <span>01 / OBSERVE</span>
                      <p>
                        Read{" "}
                        <a
                          href={`${explorer}/address/${liveDecision.snapshot.address}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {short(liveDecision.snapshot.address)}
                        </a>{" "}
                        at epoch{" "}
                        {Number(liveDecision.snapshot.epoch).toLocaleString()}:{" "}
                        {fmt(Number(liveDecision.snapshot.availableFunds), 4)}{" "}
                        USDFC available,{" "}
                        {liveDecision.snapshot.runwayDays === null
                          ? "unbounded runway"
                          : `${fmt(liveDecision.snapshot.runwayDays, 1)} days of runway`}
                        , {liveDecision.snapshot.rails.length} payment rail
                        {liveDecision.snapshot.rails.length === 1
                          ? ""
                          : "s"}{" "}
                        costing{" "}
                        {fmt(Number(liveDecision.snapshot.monthlyRate), 4)}{" "}
                        USDFC / month.
                      </p>
                    </li>
                    <li>
                      <span>02 / DECIDE</span>
                      <p>
                        {liveDecision.plan.explanation} Kept{" "}
                        {liveDecision.plan.protectedCount} protected, compacted{" "}
                        {liveDecision.plan.compactedCount}, deferred{" "}
                        {liveDecision.plan.deferredCount}.{" "}
                        {size(liveDecision.plan.retainedBytes)} selected out of{" "}
                        {size(liveDecision.plan.inputBytes)}.
                      </p>
                    </li>
                    <li>
                      <span>03 / PRICE</span>
                      <p>
                        Onchain price list:{" "}
                        {liveDecision.snapshot.prices.storagePerTibMonth} USDFC
                        per TiB / month,{" "}
                        {liveDecision.snapshot.prices.addBaseFee} base +{" "}
                        {liveDecision.snapshot.prices.addPieceFee} per piece,
                        across 2 provider copies. That is{" "}
                        {fmt(
                          Number(liveDecision.projection.operationFeesUsdfc),
                          4,
                        )}{" "}
                        USDFC in one-time fees and{" "}
                        {fmt(
                          Number(liveDecision.projection.depositNeededUsdfc),
                          4,
                        )}{" "}
                        USDFC of new deposit.
                      </p>
                    </li>
                    <li>
                      <span>04 / GATE</span>
                      <p>
                        {fmt(
                          Number(liveDecision.projection.projectedMonthlyUsdfc),
                          4,
                        )}{" "}
                        USDFC / month against a{" "}
                        {fmt(liveDecision.policy.maxMonthlyUsdfc, 2)} USDFC cap.{" "}
                        {liveDecision.gate.reason}
                        {liveDecision.spending &&
                          ` Rolling 30-day fees ${fmt(Number(liveDecision.spending.feesUsedUsdfc), 3)}/${fmt(Number(liveDecision.spending.feeLimitUsdfc), 2)} USDFC. ${liveDecision.spending.reason}`}
                      </p>
                    </li>
                  </ol>
                  <p className="decide-basis">{liveDecision.basis}</p>
                  <div className="decide-links">
                    <button
                      type="button"
                      onClick={() =>
                        download(
                          liveDecision,
                          `memento-live-decision-${liveDecision.snapshot.epoch}.json`,
                        )
                      }
                    >
                      <Download size={12} /> Download this decision
                    </button>
                    <a
                      href={`/api/decide?cap=${liveCap}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open the raw decision <ArrowUpRight size={12} />
                    </a>
                    <a
                      href={`${explorer}/address/${liveDecision.snapshot.address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Check the account onchain <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              )}
            </section>
          )}
          {mode === "lab" &&
            agent.receipts.some((r) => r.action === "stored" && r.verified) && (
              <div className="evidence-strip">
                <Fingerprint size={19} />
                <div>
                  <strong>Beyond the simulation.</strong>
                  <span>
                    Real archives on Filecoin. Signed decisions. Independently
                    verifiable.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMode("live");
                    navigate("receipts");
                  }}
                >
                  Inspect live evidence <ArrowUpRight size={14} />
                </button>
              </div>
            )}
          {view === "overview" && (
            <>
              <section className="overview-grid">
                <div className="runway-panel panel">
                  <div className="panel-top">
                    <span className="section-label">
                      <Activity size={15} /> STORAGE RUNWAY
                    </span>
                    <span
                      className={cn(
                        "pill",
                        mode === "live"
                          ? "neutral"
                          : plan.mode === "survival"
                            ? "amber"
                            : "green",
                      )}
                    >
                      {mode === "live"
                        ? chain
                          ? chain.rails.length
                            ? "Account observed"
                            : "No active rails"
                          : "Awaiting RPC"
                        : plan.mode === "survival"
                          ? "Reserve at risk"
                          : "Reserve protected"}
                    </span>
                  </div>
                  <div className="runway-number">
                    {mode === "live" && !chain
                      ? "N/A"
                      : activeDays == null
                        ? "∞"
                        : fmt(activeDays, 1)}
                    <span>
                      {activeDays == null && chain ? "no spend rate" : "days"}
                    </span>
                  </div>
                  <p className="runway-caption">
                    {mode === "live"
                      ? "Until available funds reach the lockup reserve."
                      : "Estimated with Memento’s memory plan."}
                  </p>
                  {mode === "lab" ? (
                    <>
                      <RunwayChart plan={plan} />
                      <div className="chart-legend">
                        <span>
                          <i /> Memento
                        </span>
                        <span>
                          <i className="dashed" /> Store everything
                        </span>
                        <span className="chart-disclaimer">
                          Conservative fee projection
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="live-treasury">
                      <div>
                        <span>Deposited in Filecoin Pay</span>
                        <strong>
                          {chain ? fmt(Number(chain.funds), 4) : "N/A"}{" "}
                          <small>USDFC</small>
                        </strong>
                      </div>
                      <div>
                        <span>Locked reserve</span>
                        <strong>
                          {chain ? fmt(Number(chain.totalLockup), 4) : "N/A"}{" "}
                          <small>USDFC</small>
                        </strong>
                      </div>
                      <div>
                        <span>Wallet available for top-ups</span>
                        <strong>
                          {chain ? fmt(Number(chain.walletUsdfc), 2) : "N/A"}{" "}
                          <small>tUSDFC</small>
                        </strong>
                      </div>
                      <div>
                        <span>Gas balance</span>
                        <strong>
                          {chain ? fmt(Number(chain.walletFil), 4) : "N/A"}{" "}
                          <small>tFIL</small>
                        </strong>
                      </div>
                    </div>
                  )}
                  <div className="runway-footer">
                    <ShieldCheck size={15} />
                    <span>{policy.reserveDays}-day reserve target</span>
                    <button onClick={() => navigate("policy")}>
                      Edit policy <ArrowUpRight size={12} />
                    </button>
                  </div>
                </div>
                <div className="hero-panel">
                  <div className="hero-top">
                    <span className="section-label">
                      THE ART OF REMEMBERING
                    </span>
                    <span className="hero-code">M / 001</span>
                  </div>
                  <MemorySculpture />
                  <div className="hero-copy">
                    <h2>
                      Keep the signal.
                      <br />
                      <span>Let go of the noise.</span>
                    </h2>
                    <p>Not every memory deserves a forever home.</p>
                  </div>
                  <div className="hero-footer">
                    <span>
                      <LockKeyhole size={13} /> Core memories stay protected
                    </span>
                    <ArrowDownLeft size={19} />
                  </div>
                </div>
              </section>
              <section className="stats-row">
                <div className="stat">
                  <span>
                    <Wallet size={15} />{" "}
                    {mode === "live" ? "Available funds" : "Scenario budget"}
                  </span>
                  <strong>
                    {mode === "live"
                      ? chain
                        ? fmt(Number(chain.availableFunds), 4)
                        : "N/A"
                      : fmt(balance)}
                    <small>USDFC</small>
                  </strong>
                  <p>
                    {mode === "live"
                      ? `${chain ? fmt(Number(chain.totalLockup), 4) : "N/A"} USDFC locked in reserve`
                      : "Unreserved funds in this scenario"}
                  </p>
                </div>
                <div className="stat">
                  <span>
                    <Database size={15} />{" "}
                    {mode === "live"
                      ? "Lab memory footprint"
                      : "Memory footprint"}
                  </span>
                  <strong>
                    {size(plan.retainedBytes)}
                    <small className="saving">
                      ↓{" "}
                      {Math.round(
                        (1 - plan.retainedBytes / plan.inputBytes) * 100,
                      )}
                      %
                    </small>
                  </strong>
                  <p>{size(plan.inputBytes)} before selection · payload only</p>
                </div>
                <div className="stat">
                  <span>
                    <ShieldCheck size={15} />{" "}
                    {mode === "live"
                      ? "Lab priority retained"
                      : "Priority retained"}
                  </span>
                  <strong>
                    {plan.retainedUtilityPercent}
                    <small>%</small>
                  </strong>
                  <p>
                    Heuristic score · {plan.protectedCount} of{" "}
                    {plan.protectedCount} protected memories
                  </p>
                </div>
                <div className="stat">
                  <span>
                    <Layers size={15} />{" "}
                    {mode === "live"
                      ? "Current monthly rate"
                      : "Write fees avoided"}
                  </span>
                  <strong>
                    {mode === "live"
                      ? chain
                        ? fmt(Number(chain.monthlyRate), 4)
                        : "N/A"
                      : fmt(plan.baselineFees - plan.plannedFees, 3)}
                    <small>USDFC</small>
                  </strong>
                  <p>
                    {mode === "live"
                      ? "Aggregate of actual payment rails"
                      : "One bundle vs. one piece per memory"}
                  </p>
                </div>
              </section>
              <section className="decision-grid">
                <div className="decision-panel panel">
                  <div className="panel-top">
                    <div>
                      <span className="section-label">
                        <Sparkles size={15} />{" "}
                        {mode === "lab"
                          ? "WATCH THE DECISION"
                          : "AGENT ACTIVITY"}
                      </span>
                      <h2>
                        {mode === "lab"
                          ? "A little pressure. A smarter memory."
                          : agent.running
                            ? "The agent is working."
                            : "The evidence is the story."}
                      </h2>
                    </div>
                    <span className="small-index">01 / 04</span>
                  </div>
                  {mode === "lab" ? (
                    <>
                      <div className="pressure-control">
                        <div>
                          <label htmlFor="budget">
                            Available storage budget
                          </label>
                          <strong>
                            {fmt(balance)} <span>USDFC</span>
                          </strong>
                        </div>
                        <input
                          id="budget"
                          type="range"
                          min="0.05"
                          max="1.5"
                          step="0.01"
                          value={balance}
                          disabled={running}
                          onChange={(e) => {
                            setBalance(Number(e.target.value));
                            setHasRun(false);
                            setStep(-1);
                          }}
                        />
                        <div className="range-labels">
                          <span>Under pressure</span>
                          <span>Room to remember</span>
                        </div>
                      </div>
                      <StageFeed step={step} plan={plan} running={running} />
                      <div className="decision-actions">
                        <span>
                          {hasRun ? (
                            <>
                              <CheckCheck size={15} /> Scenario receipt ready
                            </>
                          ) : (
                            <>
                              <LockKeyhole size={13} /> Your core memories are
                              protected
                            </>
                          )}
                        </span>
                        <Button
                          onClick={run}
                          disabled={running}
                          className="run-button"
                        >
                          {running ? (
                            <LoaderCircle size={15} className="spin" />
                          ) : (
                            <Play size={14} fill="currentColor" />
                          )}
                          {running
                            ? "Deciding…"
                            : hasRun
                              ? "Run again"
                              : "Run decision"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="live-events">
                        {agent.events.length ? (
                          agent.events.slice(0, 5).map((e) => (
                            <div className="live-event" key={e.id}>
                              <span
                                className={cn(
                                  "event-dot",
                                  e.stage === "error" && "error",
                                )}
                              />
                              <div>
                                <strong>{e.title}</strong>
                                <p>{e.detail}</p>
                                <time>
                                  {new Date(e.at).toLocaleTimeString()}
                                </time>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-state">
                            <Radio size={26} />
                            <h3>Listening for the first cycle</h3>
                            <p>
                              The operator runs the autonomous worker. Its
                              observations, decisions, and transaction evidence
                              appear here.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="decision-actions">
                        <span>
                          <span className="status-dot" />{" "}
                          {agent.running
                            ? "Cycle in progress"
                            : agent.evidenceMode === "recorded"
                              ? "Recorded evidence · live treasury"
                              : "Read-only observer"}{" "}
                          · refreshes every 15s
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => navigate("receipts")}
                        >
                          View receipts <ArrowRight size={14} />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <div className="allocation-panel panel">
                  <div className="panel-top">
                    <div>
                      <span className="section-label">
                        {mode === "live"
                          ? "LOCAL SCENARIO ALLOCATION"
                          : "MEMORY ALLOCATION"}
                      </span>
                      <h2>What earns its place.</h2>
                    </div>
                    <button
                      className="icon-button"
                      aria-label="Open memory vault"
                      onClick={() => navigate("memories")}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                  <div
                    className="allocation-bar"
                    aria-label="Allocation by memory count"
                  >
                    {["keep", "compact", "defer"].map((action) => (
                      <div
                        key={action}
                        className={action}
                        style={{
                          flex: Math.max(
                            0.05,
                            plan.decisions.filter((d) => d.action === action)
                              .length,
                          ),
                        }}
                      />
                    ))}
                  </div>
                  <div className="allocation-legend">
                    <span>
                      <i className="keep" />
                      Keep
                    </span>
                    <span>
                      <i className="compact" />
                      Compact
                    </span>
                    <span>
                      <i className="defer" />
                      Defer
                    </span>
                  </div>
                  <div className="memory-mini-list">
                    {plan.decisions.slice(0, 5).map((m) => (
                      <button key={m.id} onClick={() => setSelected(m)}>
                        <div
                          className={cn(
                            "file-icon",
                            m.kind === "core" && "protected",
                          )}
                        >
                          {m.kind === "core" ? (
                            <LockKeyhole size={15} />
                          ) : (
                            <FileText size={15} />
                          )}
                        </div>
                        <div>
                          <strong>{m.title}</strong>
                          <span>
                            {m.kind === "core"
                              ? "Protected core"
                              : `Utility ${m.utility}/100`}{" "}
                            · {size(m.originalBytes)}
                          </span>
                        </div>
                        <span className={cn("action-label", m.action)}>
                          {m.action}
                        </span>
                      </button>
                    ))}
                  </div>
                  <button
                    className="all-memories"
                    onClick={() => navigate("memories")}
                  >
                    Explore all {memories.length} memories{" "}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </section>
              <div className="insight">
                <div className="insight-icon">
                  <Sparkles size={18} />
                </div>
                <p>
                  <strong>
                    The smartest byte is the one you don’t need to store.
                  </strong>{" "}
                  Bundling avoids repeated write fees. Compaction saves bytes;
                  it does not erase existing payment rails.
                </p>
                <span>MEMORY, WITH INTENTION</span>
              </div>
            </>
          )}
          {view === "memories" && (
            <section className="panel vault">
              <div className="vault-toolbar">
                <div className="search">
                  <Search size={16} />
                  <input
                    aria-label="Search memories"
                    placeholder="Search your memories…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="filter-tabs">
                  {["all", "keep", "compact", "defer"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(filter === f && "active")}
                    >
                      {f === "all" ? "All memories" : f}
                    </button>
                  ))}
                </div>
                <Button onClick={() => setAdd(true)}>
                  <Plus size={15} /> Add memory
                </Button>
              </div>
              <div className="table-scroll">
                <table className="memory-table">
                  <thead>
                    <tr>
                      <th>Memory</th>
                      <th>Utility</th>
                      <th>Original</th>
                      <th>Plan</th>
                      <th>Retained</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((m) => (
                      <tr key={m.id} onClick={() => setSelected(m)}>
                        <td>
                          <div className="table-title">
                            <div
                              className={cn(
                                "file-icon",
                                m.kind === "core" && "protected",
                              )}
                            >
                              {m.kind === "core" ? (
                                <LockKeyhole size={16} />
                              ) : (
                                <FileText size={16} />
                              )}
                            </div>
                            <div>
                              <strong>{m.title}</strong>
                              <span>{m.kind}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="utility">
                            <span>{m.utility}</span>
                            <div>
                              <i style={{ width: `${m.utility}%` }} />
                            </div>
                          </div>
                        </td>
                        <td>{size(m.originalBytes)}</td>
                        <td>
                          <span className={cn("action-label", m.action)}>
                            {m.action}
                          </span>
                        </td>
                        <td>{size(m.retainedBytes)}</td>
                        <td>
                          <button
                            aria-label={`Inspect ${m.title}`}
                            className="icon-button"
                            onClick={() => setSelected(m)}
                          >
                            <ArrowUpRight size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!shown.length && (
                  <div className="empty-state">
                    <Search size={24} />
                    <h3>No memories found</h3>
                    <p>Try another search or filter.</p>
                  </div>
                )}
              </div>
              <div className="table-footer">
                {shown.length} memories · local scenario data
                <span>
                  <LockKeyhole size={13} /> Pinned originals are never compacted
                </span>
              </div>
            </section>
          )}
          {view === "receipts" && (
            <>
              <div className="receipts-heading">
                <div>
                  <span className="section-label">
                    {mode === "lab"
                      ? "SCENARIO RECEIPTS"
                      : "CALIBRATION RECEIPTS"}
                  </span>
                  <p>
                    {mode === "lab"
                      ? "Reproducible policy outputs from your decision lab."
                      : "Real chain observations, agent signatures, and retrieval evidence."}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    mode === "lab"
                      ? download(
                          { mode: "simulation", receipts: labReceipts },
                          "memento-lab-receipts.json",
                        )
                      : fetch("/api/receipts")
                          .then((r) => r.json())
                          .then((r) => download(r, "memento-receipts.json"))
                  }
                >
                  <Download size={15} /> Export JSON
                </Button>
              </div>
              {mode === "lab" ? (
                labReceipts.length ? (
                  <div className="receipt-list">
                    {labReceipts.map((r, i) => (
                      <button
                        className="receipt-card panel"
                        key={r.at}
                        onClick={() =>
                          download(
                            { mode: "simulation", ...r },
                            "memento-scenario.json",
                          )
                        }
                      >
                        <div className="receipt-symbol">
                          <Fingerprint size={25} />
                        </div>
                        <div>
                          <h3>Memory decision #{labReceipts.length - i}</h3>
                          <p>
                            {r.plan.protectedCount} protected ·{" "}
                            {r.plan.compactedCount} compacted ·{" "}
                            {r.plan.deferredCount} deferred
                          </p>
                          <time>{new Date(r.at).toLocaleString()}</time>
                        </div>
                        <span className="pill neutral">
                          Scenario · unsigned
                        </span>
                        <Download size={16} />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state panel large">
                    <Fingerprint size={35} />
                    <h3>A good decision leaves a trail.</h3>
                    <p>Run a scenario to create your first decision receipt.</p>
                    <Button onClick={() => navigate("overview")}>
                      Open decision lab <ArrowRight size={15} />
                    </Button>
                  </div>
                )
              ) : agent.receipts.length ? (
                <div className="receipt-list">
                  {agent.receipts.map((r) => (
                    <button
                      className="receipt-card panel"
                      key={r.id}
                      onClick={() => {
                        setReceipt(r);
                        setVerification(null);
                        setVerifyError("");
                      }}
                    >
                      <div className="receipt-symbol">
                        <Fingerprint size={25} />
                      </div>
                      <div>
                        <h3>
                          {r.action === "stored"
                            ? "Memory archive committed"
                            : r.action === "funded"
                              ? "Reserve topped up autonomously"
                              : r.action === "pending"
                                ? "Commit in progress"
                                : r.action === "deferred"
                                  ? "Write deferred autonomously"
                                  : "Cycle stopped"}
                        </h3>
                        <p>
                          Epoch {r.snapshot.epoch} · {r.id.slice(0, 8)}
                        </p>
                        <time>{new Date(r.createdAt).toLocaleString()}</time>
                      </div>
                      <span
                        className={cn("pill", r.verified ? "green" : "neutral")}
                      >
                        {r.verified ? "Retrieval verified" : r.action}
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state panel large">
                  <Radio size={35} />
                  <h3>
                    {loading
                      ? "Reading decision receipts…"
                      : "Ready for real evidence."}
                  </h3>
                  <p>
                    {loading
                      ? "Loading the recorded decisions and current Filecoin account."
                      : "Completed operator cycles will appear here. Scenario results never appear as onchain receipts."}
                  </p>
                  <Button variant="outline" onClick={() => void refresh()}>
                    Refresh evidence <RefreshCw size={14} />
                  </Button>
                </div>
              )}
            </>
          )}
          {view === "policy" && (
            <div className="policy-grid">
              <section className="panel policy-panel">
                <span className="section-label">
                  <Settings2 size={15} /> DECISION LAB POLICY
                </span>
                <h2>Give your agent a compass.</h2>
                <p className="muted">
                  These controls change the local scenario. The live worker uses
                  its operator configuration.
                </p>
                <div className="policy-field">
                  <div>
                    <label htmlFor="reserve">Minimum reserve runway</label>
                    <strong>{policy.reserveDays} days</strong>
                  </div>
                  <input
                    id="reserve"
                    type="range"
                    min="1"
                    max="30"
                    value={policy.reserveDays}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        reserveDays: Number(e.target.value),
                      })
                    }
                  />
                  <p>
                    The agent becomes selective before it reaches this boundary.
                  </p>
                </div>
                <div className="policy-field">
                  <div>
                    <label htmlFor="utility">Minimum memory utility</label>
                    <strong>{policy.minUtility}/100</strong>
                  </div>
                  <input
                    id="utility"
                    type="range"
                    min="0"
                    max="95"
                    value={policy.minUtility}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        minUtility: Number(e.target.value),
                      })
                    }
                  />
                  <p>Below this score, unpinned memories stay local.</p>
                </div>
                <div className="policy-toggle">
                  <div>
                    <label htmlFor="compaction">
                      Allow extractive compaction
                    </label>
                    <p>Preserve source sentences, omit repeated context.</p>
                  </div>
                  <input
                    id="compaction"
                    type="checkbox"
                    role="switch"
                    checked={policy.allowCompaction}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        allowCompaction: e.target.checked,
                      })
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPolicy(DEFAULT_POLICY);
                    setToast("Default policy restored.");
                  }}
                >
                  Restore defaults <RefreshCw size={14} />
                </Button>
              </section>
              <div>
                <section className="policy-protection">
                  <ShieldCheck size={29} />
                  <h2>
                    Some things are
                    <br />
                    non-negotiable.
                  </h2>
                  <ul>
                    <li>
                      <Check size={15} /> Protected memories keep every byte.
                    </li>
                    <li>
                      <Check size={15} /> Missing financial data stops live
                      writes.
                    </li>
                    <li>
                      <Check size={15} /> No mainnet funds. Calibration only.
                    </li>
                    <li>
                      <Check size={15} /> Every stored archive gets a retrieval
                      check.
                    </li>
                    <li>
                      <Check size={15} /> Deferred sources remain local.
                    </li>
                  </ul>
                </section>
                <div className="policy-footnote">
                  <Fingerprint size={18} />
                  <p>
                    Utility is a transparent heuristic, based on importance,
                    use, and age. It measures retention preference, not truth.
                  </p>
                </div>
              </div>
            </div>
          )}
          <footer className="page-footer">
            <span>
              <Logo small /> Memory, with a survival instinct.
            </span>
            <span>
              FILECOIN ONCHAIN CLOUD <span className="footer-star">✳</span>{" "}
              BUILT FOR AGENTS
            </span>
          </footer>
        </main>
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="detail-dialog">
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription>
              Inspect a local scenario decision and its retained text.
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <div className="detail-meta">
                <span className={cn("action-label", selected.action)}>
                  {selected.action}
                </span>
                <span>Utility {selected.utility}/100</span>
                <span>
                  {size(selected.originalBytes)} →{" "}
                  {size(selected.retainedBytes)}
                </span>
              </div>
              <div className="reason-box">
                <Sparkles size={17} />
                <p>{selected.reason}</p>
              </div>
              <label className="section-label">
                {selected.action === "defer"
                  ? "SOURCE REMAINS LOCAL"
                  : "RETAINED CONTENT"}
              </label>
              <pre className="content-preview">
                {selected.content ||
                  memories.find((m) => m.id === selected.id)?.content}
              </pre>
              <p className="muted small-text">
                Compacted text is extracted verbatim. Live archives also record
                the original source SHA-256.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="detail-dialog">
          <DialogHeader>
            <DialogTitle>Your agent profile</DialogTitle>
            <DialogDescription>
              Personalize the names shown in this demo session.
            </DialogDescription>
          </DialogHeader>
          <form
            className="memory-form"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const name = String(data.get("name") || "").trim();
              const workspace = String(data.get("workspace") || "").trim();
              if (!name || !workspace) return;
              setProfile({ name, workspace });
              setProfileOpen(false);
              setToast("Agent profile updated for this session.");
            }}
          >
            <label htmlFor="profile-name">Agent name</label>
            <input
              id="profile-name"
              name="name"
              defaultValue={profile.name}
              required
              maxLength={40}
              pattern={".*\\S.*"}
            />
            <label htmlFor="profile-workspace">Workspace name</label>
            <input
              id="profile-workspace"
              name="workspace"
              defaultValue={profile.workspace}
              required
              maxLength={40}
              pattern={".*\\S.*"}
            />
            <Button type="submit">
              Save profile <Check size={15} />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="detail-dialog">
          <DialogHeader>
            <DialogTitle>A memory worth keeping.</DialogTitle>
            <DialogDescription>
              Memento is an autonomous memory treasury for AI agents.
            </DialogDescription>
          </DialogHeader>
          <div className="help-steps">
            {[
              {
                icon: Wallet,
                title: "Observe",
                body: "Read the real Filecoin Pay balance, lockup reserve, current spending rate, and runway.",
              },
              {
                icon: Sparkles,
                title: "Decide",
                body: "Rank memories by usefulness. Keep protected originals, extract high-signal passages, and decline noise.",
              },
              {
                icon: ShieldCheck,
                title: "Act",
                body: "Quote the exact archive with Synapse. Top up within the operator’s cap or defer the write autonomously.",
              },
              {
                icon: Fingerprint,
                title: "Verify",
                body: "Store two provider copies, retrieve the archive, compare SHA-256, and save the signed evidence.",
              },
            ].map((s) => (
              <div key={s.title}>
                <s.icon size={20} />
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="reason-box">
            <FlaskConical size={19} />
            <p>
              The decision lab is an interactive simulation. Its runway
              projection conservatively charges write fees against available
              funds. Actual Filecoin fees draw from lifecycle reserves; the live
              worker uses the exact SDK quote. Live onchain shows real RPC reads
              and worker receipts.
            </p>
          </div>
          <a
            className="text-link"
            href="https://github.com/hrsh22/memento"
            target="_blank"
            rel="noreferrer"
          >
            Read the implementation <ArrowUpRight size={14} />
          </a>
        </DialogContent>
      </Dialog>
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent className="detail-dialog">
          <DialogHeader>
            <DialogTitle>Add a memory to the lab</DialogTitle>
            <DialogDescription>
              Try your own text and see whether it earns a place in the archive.
              It stays in this browser session.
            </DialogDescription>
          </DialogHeader>
          <form
            className="memory-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim() || !newContent.trim()) return;
              setMemories((m) => [
                ...m,
                {
                  id: crypto.randomUUID(),
                  title: newTitle.trim(),
                  content: newContent.trim(),
                  kind: "research",
                  importance: newImportance,
                  accesses: 0,
                  ageDays: 0,
                  pinned: false,
                },
              ]);
              setAdd(false);
              setNewTitle("");
              setNewContent("");
              setHasRun(false);
              setToast("Memory added to the decision lab.");
            }}
          >
            <label htmlFor="memory-title">Title</label>
            <input
              id="memory-title"
              required
              maxLength={100}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="A finding worth remembering"
            />
            <label htmlFor="memory-content">Memory content</label>
            <textarea
              id="memory-content"
              required
              maxLength={30000}
              rows={6}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="What did your agent learn?"
            />
            <label htmlFor="importance">Importance · {newImportance}/100</label>
            <input
              id="importance"
              type="range"
              min="0"
              max="100"
              value={newImportance}
              onChange={(e) => setNewImportance(Number(e.target.value))}
            />
            <Button type="submit">
              Add to memory vault <Plus size={15} />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!receipt}
        onOpenChange={(o) => {
          if (!o) setReceipt(null);
        }}
      >
        <DialogContent className="detail-dialog" initialFocus={receiptTitle}>
          <DialogHeader>
            <DialogTitle ref={receiptTitle} tabIndex={-1}>
              Decision evidence
            </DialogTitle>
            <DialogDescription>
              Calibration receipt · {receipt?.id}
            </DialogDescription>
          </DialogHeader>
          {receipt && (
            <>
              <div className="detail-meta">
                <span
                  className={cn("pill", receipt.verified ? "green" : "neutral")}
                >
                  {receipt.verified ? "Retrieval verified" : receipt.action}
                </span>
                <span>Epoch {receipt.snapshot.epoch}</span>
              </div>
              <p className="receipt-reason">
                {receipt.reason.replace(/Content fingerprint .*/i, "")}
              </p>
              <div className="receipt-budget">
                <div>
                  <span>Available when observed</span>
                  <strong>
                    {fmt(Number(receipt.snapshot.availableFunds), 4)} USDFC
                  </strong>
                </div>
                <div>
                  <span>Reserve at decision</span>
                  <strong>
                    {receipt.snapshot.runwayDays === null
                      ? "No active spend"
                      : fmt(receipt.snapshot.runwayDays, 2) + " days"}
                  </strong>
                </div>
                {receipt.quote && (
                  <>
                    <div>
                      <span>Exact archive quote</span>
                      <strong>
                        {receipt.quote.archiveBytes.toLocaleString()} bytes
                      </strong>
                    </div>
                    <div>
                      <span>Projected monthly rate</span>
                      <strong>
                        {fmt(Number(receipt.quote.projectedMonthlyUsdfc), 6)}{" "}
                        USDFC
                      </strong>
                    </div>
                    <div>
                      <span>Required deposit</span>
                      <strong>
                        {fmt(Number(receipt.quote.depositNeededUsdfc), 6)} USDFC
                      </strong>
                    </div>
                  </>
                )}
              </div>
              {receipt.spending && (
                <div className="spend-evidence">
                  <strong>
                    {receipt.spending.allowed
                      ? "Cumulative budget passed"
                      : "Cumulative budget refused"}
                  </strong>
                  <p>30-day allowances at this decision</p>
                  <dl>
                    <div>
                      <dt>Operation fees</dt>
                      <dd>
                        {fmt(Number(receipt.spending.feesUsedUsdfc), 3)} used +{" "}
                        {fmt(Number(receipt.spending.requestedFeesUsdfc), 3)}{" "}
                        requested / {receipt.spending.feeLimitUsdfc} USDFC
                      </dd>
                    </div>
                    <div>
                      <dt>Reserve funding</dt>
                      <dd>
                        {fmt(Number(receipt.spending.depositsUsedUsdfc), 4)}{" "}
                        used +{" "}
                        {fmt(Number(receipt.spending.requestedDepositUsdfc), 4)}{" "}
                        requested / {receipt.spending.depositLimitUsdfc} USDFC
                      </dd>
                    </div>
                  </dl>
                  <small>
                    Tracking enabled{" "}
                    {new Date(receipt.spending.trackingSince).toLocaleString()}.
                    Earlier activity is outside this ledger.
                  </small>
                </div>
              )}
              <div className="detail-meta">
                <span>{receipt.plan.protectedCount} protected</span>
                <span>{receipt.plan.compactedCount} compacted</span>
                <span>{receipt.plan.deferredCount} deferred</span>
              </div>
              {receipt.payloadHash && (
                <div className="proof-field">
                  <label>ARCHIVE SHA-256</label>
                  <code>{receipt.payloadHash}</code>
                </div>
              )}
              {receipt.pieceCid && (
                <div className="proof-field">
                  <label>FILECOIN PIECE CID</label>
                  <code>{receipt.pieceCid}</code>
                </div>
              )}
              {receipt.pieceCid && (
                <Button
                  onClick={() => void verify(receipt.id)}
                  disabled={verifying}
                >
                  <ShieldCheck size={15} className={verifying ? "spin" : ""} />
                  {verifying
                    ? "Checking chain & retrieving…"
                    : "Verify independently now"}
                </Button>
              )}
              {verifyError && (
                <p role="alert" className="verification-error">
                  {verifyError}
                </p>
              )}
              {verification && (
                <div className="verification-result" role="status">
                  <strong>
                    {verification.verified
                      ? "Fresh verification passed"
                      : "Verification did not pass"}
                  </strong>
                  <p>
                    {verification.signatureValid ? "✓" : "×"} Agent archive
                    signature · {verification.hashMatches ? "✓" : "×"} Retrieved
                    SHA-256
                  </p>
                  <p>
                    {verification.onchainConfirmed ? "✓" : "×"} PieceCID
                    included in both live PDP datasets
                  </p>
                  {verification.decisionSignatureValid !== null && (
                    <p>
                      {verification.decisionSignatureValid ? "✓" : "×"}{" "}
                      Financial decision receipt signature
                    </p>
                  )}
                  <p>
                    {verification.bytes.toLocaleString()} bytes retrieved ·{" "}
                    {new Date(verification.checkedAt).toLocaleTimeString()}
                  </p>
                  {verification.retrievalCopies?.map((copy) => (
                    <p key={copy.providerId}>
                      {copy.hashMatches ? "✓" : "×"} Provider {copy.providerId}:{" "}
                      {copy.bytes.toLocaleString()} bytes independently
                      retrieved and checked
                    </p>
                  ))}
                  <span>
                    Dataset inclusion and retrieval integrity. Not a claim of
                    future availability or semantic correctness.
                  </span>
                </div>
              )}
              {receipt.copies?.map((c) => (
                <a
                  className="provider-link"
                  key={c.providerId}
                  href={c.retrievalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Database size={16} />
                  <span>
                    Provider {c.providerId} · dataset {c.dataSetId} · piece{" "}
                    {c.pieceId}
                  </span>
                  <ExternalLink size={14} />
                </a>
              ))}
              {receipt.depositTx && (
                <a
                  className="text-link"
                  href={`${explorer}/tx/${receipt.depositTx}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View reserve transaction <ArrowUpRight size={14} />
                </a>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  download(receipt, `memento-${receipt.id.slice(0, 8)}.json`)
                }
              >
                <Download size={15} /> Export full receipt
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      {toast && (
        <div role="status" className="toast">
          <CheckCheck size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}
