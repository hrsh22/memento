import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Fingerprint,
  ShieldCheck,
} from "lucide-react";
import styles from "./welcome.module.css";

export default function Page() {
  return (
    <div className={styles.page}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark} aria-label="Memento home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          memento<span className={styles.dot}>.</span>
        </Link>
        <nav aria-label="Main navigation">
          <a className={styles.source} href="https://github.com/hrsh22/memento">
            View source <ArrowUpRight size={14} />
          </a>
          <Link href="/demo" className={styles.navLink}>
            Open app <ArrowRight size={15} />
          </Link>
        </nav>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="welcome-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <span /> MEMORY, WITH INTENTION
            </p>
            <h1 id="welcome-title">
              An agent that knows
              <br />
              what it can afford
              <br />
              to <em>remember.</em>
            </h1>
            <p className={styles.description}>
              AI agents collect notes, results, and tool logs. Keeping
              everything costs money. Memento reads its storage budget and
              decides what to keep, shorten, or leave behind.
            </p>
            <div className={styles.actions}>
              <Link href="/demo" className={styles.primary}>
                Try the decision lab <ArrowRight size={18} />
              </Link>
              <Link href="/watch" className={styles.secondary}>
                Watch a real agent run <ArrowUpRight size={16} />
              </Link>
            </div>
            <p className={styles.noWallet}>
              No signup. No wallet needed to explore.
            </p>
          </div>
          <aside
            className={styles.example}
            aria-label="Example of a real recorded budget decision"
          >
            <div className={styles.exampleTop}>
              <Fingerprint size={20} />
              <span>A REAL DECISION / CALIBRATION</span>
            </div>
            <h2>
              Having funds doesn’t
              <br />
              mean spending them.
            </h2>
            <div className={styles.quote}>
              <div>
                <span>Recurring cost limit</span>
                <strong>
                  0.10 <small>USDFC</small>
                </strong>
              </div>
              <div>
                <span>Quoted storage cost</span>
                <strong>
                  0.24 <small>USDFC / MO</small>
                </strong>
              </div>
            </div>
            <div className={styles.verdict}>
              <ShieldCheck size={23} />
              <div>
                <strong>Write declined. Budget protected.</strong>
                <p>
                  The wallet had funds. The quote exceeded the limit. Memento
                  chose to wait.
                </p>
              </div>
            </div>
            <Link href="/demo?evidence=1" className={styles.receiptLink}>
              Inspect the recorded decision <ArrowRight size={16} />
            </Link>
            <span className={styles.receiptLabel}>
              RECEIPT d95d79de · 05 SEP 2026
            </span>
          </aside>
        </section>
        <section className={styles.how} aria-labelledby="how-title">
          <div className={styles.sectionTitle}>
            <p className={styles.eyebrow}>HOW IT WORKS</p>
            <h2 id="how-title">Useful memories. A finite budget.</h2>
          </div>
          <div className={styles.steps}>
            <article>
              <span>01 / OBSERVE</span>
              <h3>Know the budget.</h3>
              <p>
                Read the Filecoin balance, storage costs, and how many days of
                funding remain.
              </p>
            </article>
            <article>
              <span>02 / DECIDE</span>
              <h3>Keep what matters.</h3>
              <p>
                Protect essential memories, shorten useful notes, and defer
                low-value noise.
              </p>
            </article>
            <article>
              <span>03 / ACT & VERIFY</span>
              <h3>Make it accountable.</h3>
              <p>
                Store within limits or top up the reserve. Leave signed receipts
                you can verify.
              </p>
            </article>
          </div>
        </section>
        <div className={styles.exploreNote}>
          <Check size={18} />
          <p>
            <strong>Start in the lab:</strong> change a budget and watch the
            decision. <strong>Then explore live evidence:</strong> recorded
            testnet actions, current balances, and fresh archive verification.
          </p>
        </div>
      </main>
      <footer className={styles.footer}>
        <span>Built on Filecoin. Designed for agents.</span>
        <span>Calibration testnet · No real-money demo transactions</span>
      </footer>
    </div>
  );
}
