export default function Spinner({ size = 'md' }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className={`${s} border-2 border-accent/30 border-t-accent rounded-full animate-spin`} />
  );
}
