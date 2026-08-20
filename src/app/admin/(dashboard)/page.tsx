import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dashboardMetrics } from "@/lib/data/orders";
import { fmtBRL } from "@/lib/constants";
import { StatusBadge } from "@/components/admin/ui";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user.role !== "general_admin") redirect("/admin/products");

  const metrics = await dashboardMetrics();
  const maxBarPct = Math.max(...metrics.salesChart.map((b) => b.pct), 4);

  return (
    <div>
      <h1 className="mb-6 text-[22px] font-bold text-white">Dashboard</h1>

      <div className="mb-7 grid grid-cols-3 gap-4">
        <MetricCard label="VENDAS TOTAIS" value={fmtBRL(metrics.totalSales)} />
        <MetricCard label="PEDIDOS" value={String(metrics.orderCount)} />
        <MetricCard label="MAIS VENDIDO" value={metrics.bestSeller || "Sem dados ainda"} small />
      </div>

      <div className="mb-7 grid grid-cols-[1.4fr_1fr] gap-4">
        <Panel title="VENDAS POR DIA">
          {metrics.salesChart.length === 0 ? (
            <div className="py-4 text-[13px] text-admin-text3">Nenhuma venda registrada ainda.</div>
          ) : (
            <div className="flex h-[140px] items-end gap-3.5">
              {metrics.salesChart.map((bar, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div
                    className="w-full rounded-t-[3px] bg-admin-blue"
                    style={{ height: `${(bar.pct / maxBarPct) * 100}%` }}
                  />
                  <span className="text-[10.5px] text-admin-text3">{bar.label}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="PEDIDOS POR STATUS">
          <div className="flex flex-col gap-3.5">
            {metrics.statusChart.map((s) => (
              <div key={s.label}>
                <div className="mb-1.5 flex justify-between text-xs text-admin-text2">
                  <span>{s.label}</span>
                  <span>{s.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-[3px] bg-admin-input">
                  <div className="h-full rounded-[3px] bg-admin-blue" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="PEDIDOS QUE PRECISAM DE ATENÇÃO">
        {metrics.attentionOrders.length === 0 ? (
          <div className="py-3 text-[13px] text-admin-text3">Nenhum pedido pendente no momento.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-admin-text3">
                <Th>PEDIDO</Th>
                <Th>E-MAIL</Th>
                <Th>DATA</Th>
                <Th>STATUS</Th>
                <Th>TOTAL</Th>
              </tr>
            </thead>
            <tbody>
              {metrics.attentionOrders.map((o) => (
                <tr key={o.orderNumber} className="border-t border-white/6">
                  <td className="p-3 font-mono text-[12.5px] text-white">{o.orderNumber}</td>
                  <td className="p-3 text-[12.5px] text-admin-text2">{o.email}</td>
                  <td className="p-3 text-[12.5px] text-admin-text2">{o.date}</td>
                  <td className="p-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="p-3 text-[12.5px] text-white">{fmtBRL(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

function MetricCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg border border-admin-border bg-admin-panel p-[22px]">
      <div className="mb-2.5 text-xs font-semibold text-admin-text3">{label}</div>
      <div className={`font-bold text-white ${small ? "text-[16px] leading-tight" : "text-[28px]"}`}>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-admin-border bg-admin-panel p-[22px]">
      <div className="mb-[18px] text-[13px] font-bold text-admin-text">{title}</div>
      {children}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-3 font-semibold">{children}</th>;
}
