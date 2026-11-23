"use client";

import {
  formatMoney,
  ngn,
  type VendorEarningsPreview,
  type VendorPayoutAccountPreview,
  type VendorTransactionRecord,
} from "@mealhrs/domain";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  Search,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { Metric, PageHead } from "./vendor-insights-primitives";
import styles from "./vendor-insights.module.css";

type TransactionFilter = "all" | "settled" | "pending";

function downloadCsvStatement(
  transactions: readonly VendorTransactionRecord[],
  periodLabel: string,
) {
  const headers = [
    "Reference",
    "Date",
    "Gross (NGN)",
    "MealHrs Commission 15% (NGN)",
    "Processing Fee 1.5% (NGN)",
    "Net Payout (NGN)",
    "Status",
  ];
  const rows = transactions.map((t) => [
    `"${t.reference}"`,
    `"${t.dateLabel}"`,
    t.gross.amount,
    t.commission.amount,
    t.processingFee.amount,
    t.net.amount,
    `"${t.status}"`,
  ]);
  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `mealhrs-statement-${periodLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function VendorEarningsView({
  earnings,
  transactions = [],
  payoutAccount,
}: Readonly<{
  earnings: VendorEarningsPreview;
  transactions?: readonly VendorTransactionRecord[];
  payoutAccount?: VendorPayoutAccountPreview;
}>) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [statementOpen, setStatementOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [statementMessage, setStatementMessage] = useState("");
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTxn, setSelectedTxn] = useState<VendorTransactionRecord | null>(null);

  const multiplier = period === "month" ? 4 : 1;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "settled"
            ? txn.status === "settled"
            : txn.status === "pending_payout";

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        txn.reference.toLowerCase().includes(query) ||
        txn.dateLabel.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, searchQuery]);

  const settledCount = transactions.filter((t) => t.status === "settled").length;
  const pendingCount = transactions.filter((t) => t.status === "pending_payout").length;

  const handleDownloadCsv = () => {
    downloadCsvStatement(
      filteredTransactions.length > 0 ? filteredTransactions : transactions,
      period === "week" ? "weekly-payout" : "monthly-payout",
    );
    setStatementMessage(
      `Downloaded statement for ${filteredTransactions.length || transactions.length} transactions as CSV.`,
    );
    setStatementOpen(false);
  };

  return (
    <PageHead
      eyebrow="Financial preview"
      title="Earnings & payouts"
      description={`${period === "week" ? earnings.periodLabel : "This month (scaled preview)"}. Review real-time sales, automated settlements, commission transparency, and transaction statements. These figures are illustrative and no payout transfer is connected.`}
      action={
        <div className="cluster">
          <select
            aria-label="Earnings period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as "week" | "month")}
            style={{
              border: "1px solid var(--color-line)",
              borderRadius: 9,
              padding: "7px 10px",
              fontSize: "0.72rem",
              background: "var(--color-surface)",
            }}
          >
            <option value="week">This week</option>
            <option value="month">Last 30 days</option>
          </select>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => setPayoutOpen(true)}
          >
            <Wallet aria-hidden="true" size={15} />
            Payout schedule
          </Button>
          <Button
            size="sm"
            variant="secondary"
            type="button"
            onClick={() => setStatementOpen(true)}
          >
            <Download aria-hidden="true" size={15} />
            Statement
          </Button>
        </div>
      }
    >
      {statementMessage ? (
        <p className={styles.feedback} role="status">
          {statementMessage}
        </p>
      ) : null}

      <div className={styles.grid}>
        <Metric
          label="Gross sales"
          value={formatMoney(ngn(earnings.grossSales.amount * multiplier))}
          detail={period === "week" ? earnings.periodLabel : "Last 30 days (preview)"}
        />
        <Metric
          label="Settled / collected"
          value={formatMoney(ngn(earnings.collectedAmount.amount * multiplier))}
          detail="Transferred to your bank account"
        />
        <Metric
          label="Pending payout"
          value={formatMoney(ngn(earnings.pendingPayoutAmount.amount * multiplier))}
          detail="Next settlement batch in progress"
        />
      </div>

      {/* Transparent Fee Calculation Card */}
      <section className={`card ${styles.section}`}>
        <div className="split" style={{ marginBottom: 14 }}>
          <div>
            <h2>How your payout balance is calculated</h2>
            <p className="vendor-muted" style={{ margin: 0 }}>
              MealHrs charges a flat 15% platform fee on meals. Delivery fees are 100% passed through to you with zero platform deduction.
            </p>
          </div>
        </div>

        <div className={styles.money}>
          <div>
            <span>Gross customer sales</span>
            <strong>{formatMoney(ngn(earnings.grossSales.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Platform fees (15% standard food commission)</span>
            <strong>−{formatMoney(ngn(earnings.platformFees.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Payment processing charges (1.5% Paystack fee)</span>
            <strong>−{formatMoney(ngn(earnings.processingFees.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Adjustments / pre-order compensations</span>
            <strong>{formatMoney(ngn(earnings.adjustments.amount * multiplier))}</strong>
          </div>
          <div>
            <span>Customer refunds / cancellations</span>
            <strong>−{formatMoney(ngn(earnings.refunds.amount * multiplier))}</strong>
          </div>
          <div className={styles.total}>
            <span>Net preview balance payable</span>
            <strong>{formatMoney(ngn(earnings.previewBalance.amount * multiplier))}</strong>
          </div>
        </div>
        <div className={styles.notice}>{earnings.note}</div>
      </section>

      {/* Payout Destination Account Card */}
      {payoutAccount ? (
        <section className={`card ${styles.section}`}>
          <div className="split" style={{ flexWrap: "wrap", gap: 14 }}>
            <div>
              <div className="cluster" style={{ gap: 8, alignItems: "center" }}>
                <h2>Connected settlement account</h2>
                <Status tone={payoutAccount.verified ? "success" : "warning"}>
                  {payoutAccount.verified ? "Verified payout bank" : "Verification required"}
                </Status>
              </div>
              <p className="vendor-muted" style={{ margin: "4px 0" }}>
                <strong>{payoutAccount.bankName}</strong> · {payoutAccount.accountNumberMasked} · {payoutAccount.accountName}
              </p>
              <p className="vendor-muted" style={{ fontSize: "0.68rem" }}>
                Automated schedule: <strong>{payoutAccount.settlementSchedule}</strong>. Funds are disbursed directly to this Nigerian bank account.
              </p>
            </div>
            <div className="cluster" style={{ alignItems: "center" }}>
              <Button asChild size="sm" variant="secondary">
                <Link href="/vendor/verification">
                  <ArrowUpRight aria-hidden="true" size={14} />
                  Manage verification &amp; bank
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Recent Transactions List with Search & Filters */}
      <section className={`card ${styles.section}`}>
        <div className="split" style={{ flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2>Recent transaction ledger ({filteredTransactions.length})</h2>
            <p className="vendor-muted" style={{ margin: 0 }}>
              Order-level breakdown of customer payments, MealHrs fees, payment processing, and settlement status.
            </p>
          </div>
          <div className="cluster" style={{ gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", minWidth: 200 }}>
              <Search
                aria-hidden="true"
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-muted)",
                }}
              />
              <input
                aria-label="Search transactions"
                placeholder="Search reference or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px 6px 30px",
                  fontSize: "0.72rem",
                  border: "1px solid var(--color-line)",
                  borderRadius: 8,
                  background: "var(--color-surface)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className={styles.tabs} role="tablist" aria-label="Transaction filters">
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
          >
            All transactions ({transactions.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "settled"}
            onClick={() => setFilter("settled")}
          >
            Settled ({settledCount})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === "pending"}
            onClick={() => setFilter("pending")}
          >
            Pending payout ({pendingCount})
          </button>
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ padding: "30px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, color: "var(--color-muted)", fontSize: "0.78rem" }}>
              No transactions match your search filter.
            </p>
          </div>
        ) : (
          <div className={styles.ledger}>
            {filteredTransactions.map((txn) => (
              <button
                type="button"
                className={styles.ledgerRow}
                key={txn.id}
                onClick={() => setSelectedTxn(txn)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  border: "1px solid var(--color-line)",
                  transition: "background 120ms ease, border-color 120ms ease",
                }}
              >
                <div>
                  <strong>{txn.reference}</strong>
                  <small>{txn.dateLabel}</small>
                </div>
                <div>
                  <small>Gross sales</small>
                  <strong>{formatMoney(txn.gross)}</strong>
                </div>
                <div>
                  <small>Total fees (16.5%)</small>
                  <strong style={{ color: "var(--color-muted-strong)" }}>
                    −{formatMoney(ngn(txn.commission.amount + txn.processingFee.amount))}
                  </strong>
                </div>
                <div className="cluster" style={{ gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                  <div style={{ textAlign: "right" }}>
                    <small>Net payout</small>
                    <strong style={{ color: "var(--color-green-700)" }}>{formatMoney(txn.net)}</strong>
                  </div>
                  <Status tone={txn.status === "settled" ? "success" : "warning"}>
                    {txn.status === "settled" ? "Settled" : "Pending"}
                  </Status>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Transaction Details Dialog */}
      <Dialog.Root
        open={Boolean(selectedTxn)}
        onOpenChange={(open) => !open && setSelectedTxn(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          {selectedTxn ? (
            <Dialog.Content className={styles.dialog} aria-modal="true">
              <div className={styles.dialogHead}>
                <div>
                  <p className={styles.eyebrow}>Transaction details</p>
                  <Dialog.Title>{selectedTxn.reference}</Dialog.Title>
                  <Dialog.Description>{selectedTxn.dateLabel}</Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    className={styles.dialogClose}
                    type="button"
                    aria-label="Close transaction details"
                  >
                    <X aria-hidden="true" size={16} />
                  </button>
                </Dialog.Close>
              </div>
              <div className={styles.dialogBody}>
                <div className="split" style={{ alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-muted)" }}>
                    Settlement status
                  </span>
                  <Status tone={selectedTxn.status === "settled" ? "success" : "warning"}>
                    {selectedTxn.status === "settled" ? "Settled to Bank" : "Pending Next Batch"}
                  </Status>
                </div>

                <div className={styles.money} style={{ fontSize: "0.75rem" }}>
                  <div>
                    <span>Gross customer payment</span>
                    <strong>{formatMoney(selectedTxn.gross)}</strong>
                  </div>
                  <div>
                    <span>MealHrs platform fee (15%)</span>
                    <strong>−{formatMoney(selectedTxn.commission)}</strong>
                  </div>
                  <div>
                    <span>Payment gateway charge (1.5%)</span>
                    <strong>−{formatMoney(selectedTxn.processingFee)}</strong>
                  </div>
                  <div className={styles.total}>
                    <span>Net payout to kitchen</span>
                    <strong style={{ color: "var(--color-green-700)" }}>
                      {formatMoney(selectedTxn.net)}
                    </strong>
                  </div>
                </div>

                <Notice tone="info" style={{ marginTop: 12 }}>
                  {selectedTxn.status === "settled"
                    ? `Disbursed to ${payoutAccount?.bankName ?? "registered bank account"} on ${selectedTxn.dateLabel}.`
                    : "Included in the next automated daily settlement batch at 9:00 AM."}
                </Notice>
              </div>
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>

      {/* Statement Download Dialog */}
      <Dialog.Root open={statementOpen} onOpenChange={setStatementOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          <Dialog.Content className={styles.dialog} aria-modal="true">
            <div className={styles.dialogHead}>
              <div>
                <p className={styles.eyebrow}>Financial exports</p>
                <Dialog.Title>Download statement</Dialog.Title>
                <Dialog.Description>
                  Export verified transaction history with fee breakdowns and settlement records.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  className={styles.dialogClose}
                  type="button"
                  aria-label="Close statement dialog"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </Dialog.Close>
            </div>
            <div className={styles.dialogBody}>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.68rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Export format
                  </label>
                  <div className="cluster" style={{ gap: 8 }}>
                    <button
                      type="button"
                      className={`${styles.pillOption} ${styles.pillOptionActive}`}
                    >
                      <FileSpreadsheet aria-hidden="true" size={13} style={{ marginRight: 4 }} />
                      CSV (Excel / Google Sheets)
                    </button>
                  </div>
                </div>

                <div className={styles.notice}>
                  Includes {filteredTransactions.length || transactions.length} transaction rows:
                  Reference, Date, Gross sales, MealHrs commission, Gateway fees, and Net settlement.
                </div>

                <Button type="button" onClick={handleDownloadCsv} block>
                  <Download aria-hidden="true" size={15} />
                  Download CSV statement
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Payout Schedule Dialog */}
      <Dialog.Root open={payoutOpen} onOpenChange={setPayoutOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialogBackdrop} />
          <Dialog.Content className={styles.dialog} aria-modal="true">
            <div className={styles.dialogHead}>
              <div>
                <p className={styles.eyebrow}>Settlement workflow</p>
                <Dialog.Title>Automated payout schedule</Dialog.Title>
                <Dialog.Description>
                  How customer funds move from checkout to your bank account.
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  className={styles.dialogClose}
                  type="button"
                  aria-label="Close payout schedule"
                >
                  <X aria-hidden="true" size={16} />
                </button>
              </Dialog.Close>
            </div>
            <div className={styles.dialogBody}>
              <div style={{ display: "grid", gap: 12 }}>
                <div className={styles.fact}>
                  <span>Schedule cadence</span>
                  <strong>{payoutAccount?.settlementSchedule ?? "Daily T+1 preview"}</strong>
                </div>
                <div className={styles.fact}>
                  <span>Destination bank</span>
                  <strong>
                    {payoutAccount
                      ? `${payoutAccount.bankName} (${payoutAccount.accountNumberMasked})`
                      : "No bank connected"}
                  </strong>
                </div>
                <div className={styles.fact}>
                  <span>Account holder</span>
                  <strong>{payoutAccount?.accountName ?? "Not verified"}</strong>
                </div>

                <Notice tone="info">
                  Per Nigerian banking standards, payments received on weekends and public holidays settle on the next official business banking day.
                </Notice>

                <Button asChild block variant="secondary">
                  <Link href="/vendor/verification">Update settlement bank account</Link>
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </PageHead>
  );
}
