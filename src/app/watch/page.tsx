import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Download, Fingerprint } from "lucide-react";
import { readRecording } from "@/lib/server/recording";
import { RecordingVerifier } from "@/components/recording-verifier";
import "./watch.css";
export default async function WatchPage() {
  const run = await readRecording();
  const archive = run.receipts.find((r) => r.action === "stored")!;
  const cumulative = run.receipts.find((r) => r.spending?.allowed === false)!;
  return (
    <div className="watch-page">
      <header>
        <Link href="/">
          <ArrowLeft size={16} /> Memento
        </Link>
        <Link href="/demo?evidence=1">
          Open evidence explorer <ArrowUpRight size={15} />
        </Link>
      </header>
      <main id="main">
        <p className="watch-eyebrow">TWO RECORDINGS. NOTHING STAGED.</p>
        <h1>
          Watch an agent
          <br />
          protect its budget.
        </h1>
        <p className="watch-intro">
          A funded wallet. A useful memory. A second request that goes too far.
          Follow Memento as it reads Filecoin, weighs the cost, and acts.
        </p>
        <p className="watch-step">01 — A LIVE DECISION, SCREEN-RECORDED</p>
        <div className="watch-video">
          <video
            controls
            playsInline
            preload="metadata"
            poster="/showcase/live-decision-poster.png"
            aria-label="Screen recording of a live budget decision changing from approved to refused"
          >
            <source src="/showcase/live-decision.mp4" type="video/mp4" />
            Your browser does not support video playback.
          </video>
        </div>
        <p className="watch-caption">
          An actual screen capture of the deployed app, not an animation. The
          monthly cap moves from 0.50 to 0.10 USDFC while the account&rsquo;s
          own cost stays at 0.24, and the same funded wallet is refused. Two
          idle pauses were cut; nothing else is edited, and the numbers are read
          from Calibration at the epoch shown on screen.
        </p>
        <div className="watch-actions">
          <Link href="/demo?live=1" className="watch-primary">
            Do this yourself <ArrowUpRight size={15} />
          </Link>
          <a href="/showcase/live-decision.mp4" download>
            <Download size={15} /> Download clip
          </a>
        </div>
        <p className="watch-step">02 — THE WORKER RUN THAT SPENT REAL FUNDS</p>
        <div className="watch-video">
          <video
            controls
            playsInline
            preload="metadata"
            poster="/showcase/poster.png"
            aria-label="Recorded worker run with readable event captions"
          >
            <source src="/showcase/memento-demo.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/showcase/captions.vtt"
              srcLang="en"
              label="English"
              default
            />
            Your browser does not support video playback.
          </video>
        </div>
        <p className="watch-caption">
          Playback of an actual Calibration event log, recorded{" "}
          {new Date(run.startedAt).toISOString().slice(0, 16).replace("T", " ")}{" "}
          UTC. The video visualizes captured events with readable captions.
          Playback does not send new transactions.
        </p>
        <div className="watch-actions">
          <RecordingVerifier />
          <a href="/showcase/memento-demo.mp4" download>
            <Download size={15} /> Download video
          </a>
          <a href="/showcase/run.json" download>
            Download signed run <ArrowUpRight size={15} />
          </a>
        </div>
        <section className="watch-facts" aria-label="Recorded run results">
          <div>
            <span>Useful archive</span>
            <strong>
              {archive.quote?.archiveBytes.toLocaleString()}{" "}
              <small>bytes</small>
            </strong>
          </div>
          <div>
            <span>Independent retrievals</span>
            <strong>
              {run.verification.retrievalCopies.length} <small>providers</small>
            </strong>
          </div>
          <div>
            <span>Shared fee allowance</span>
            <strong>
              {cumulative.spending?.feeLimitUsdfc}{" "}
              <small>USDFC / 30 DAYS</small>
            </strong>
          </div>
        </section>
        <section className="watch-decisions" aria-labelledby="decisions">
          <h2 id="decisions">The decisions behind the recording.</h2>
          {run.phases.map((phase, i) => (
            <article key={phase.receiptId}>
              <span className="watch-number">0{i + 1}</span>
              <div>
                <p className="watch-eyebrow">
                  {phase.action === "stored"
                    ? "ARCHIVE COMMITTED"
                    : i === 3
                      ? "DUPLICATE PREVENTED"
                      : "WRITE DEFERRED"}
                </p>
                <h3>{phase.title}</h3>
                <p>{phase.reason}</p>
                <code>{phase.receiptId}</code>
              </div>
              <Fingerprint size={20} />
            </article>
          ))}
        </section>
        <details className="watch-transcript">
          <summary>Read the uninterrupted worker event transcript</summary>
          <ol>
            {run.events.map((event) => (
              <li key={event.id}>
                <time>{event.at.slice(11, 19)} UTC</time>
                <div>
                  <strong>{event.title}</strong>
                  <p>{event.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </details>
        <div className="watch-live">
          <div>
            <strong>This run is recorded. Now make one happen.</strong>
            <p>
              Read the same account at the current epoch and run the same policy
              engine and budget gate. Move the spending cap and a funded wallet
              refuses its own write. Nothing is broadcast.
            </p>
          </div>
          <Link href="/demo?live=1">
            Run a live decision <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="watch-boundary">
          <strong>What this proves</strong>
          <p>
            Real financial refusals, an actual two-provider archive, cumulative
            fee enforcement, and duplicate prevention. Signatures establish the
            signer and integrity of the record; fresh retrieval checks both
            provider copies. This is not a claim about future availability or
            perfect memory understanding.
          </p>
          <p>
            The rolling ledger starts at its recorded activation time. It does
            not retroactively include older transactions. Operation fees and
            reserve funding have separate allowances; tFIL gas is separate.
          </p>
        </div>
      </main>
      <footer>FILECOIN CALIBRATION · MEMENTO</footer>
    </div>
  );
}
