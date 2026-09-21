import { listRepairRequests } from "@/lib/db/repair";
import { RepairStatusSelect } from "./RepairStatusSelect";

export default async function AdminRepairsPage() {
  const repairs = await listRepairRequests();

  return (
    <div>
      <h1 className="text-2xl font-bold">Demandes de réparation</h1>
      <p className="mt-1 text-neutral-600">{repairs.length} demandes reçues.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/10 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Appareil</th>
              <th className="px-4 py-3">Problèmes</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {repairs.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.customerName}</p>
                  <p className="text-xs text-neutral-500">{r.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {r.deviceBrand} {r.deviceModel}
                </td>
                <td className="px-4 py-3 text-neutral-600">{r.problemAreas.join(", ")}</td>
                <td className="px-4 py-3">
                  <RepairStatusSelect id={r.id} status={r.status} />
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(r.createdAt).toLocaleDateString("fr-MA")}
                </td>
              </tr>
            ))}
            {repairs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  Aucune demande de réparation.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
