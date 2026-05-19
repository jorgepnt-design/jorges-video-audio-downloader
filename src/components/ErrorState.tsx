export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-lg border border-ember/40 bg-ember/15 p-6 text-red-100">{message}</div>;
}
