import { listContactMessages } from "@/lib/db/contact";
import { cardClasses } from "@/components/ui/Card";

export default async function AdminMessagesPage() {
  const messages = await listContactMessages();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Messages de contact</h1>
      <p className="mt-1 text-neutral-600">{messages.length} messages reçus.</p>

      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={cardClasses("p-4")}>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-neutral-400">
                {new Date(m.createdAt).toLocaleString("fr-MA")}
              </p>
            </div>
            <p className="mt-0.5 text-sm text-neutral-500">
              {[m.phone, m.email].filter(Boolean).join(" · ") || "Aucun contact fourni"}
            </p>
            <p className="mt-2 text-sm text-neutral-700">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="py-8 text-center text-neutral-500">Aucun message pour le moment.</p>
        )}
      </div>
    </div>
  );
}
