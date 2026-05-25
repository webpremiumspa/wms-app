export function Placeholder({ title }: { title: string }) {
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">
        Esta pantalla se implementa en la fase correspondiente del plan.
      </p>
    </div>
  );
}
