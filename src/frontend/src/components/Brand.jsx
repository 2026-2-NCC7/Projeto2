export default function Brand({ mobile = false }) {
  return (
    <div className={`brand-lockup${mobile ? " mobile-brand" : ""}`}>
      <span className="brand-mark">A</span>
      <span className="brand-name">Ach.ai</span>
    </div>
  );
}
