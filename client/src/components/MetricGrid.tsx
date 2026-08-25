type MetricGridProps = {
  metrics: Record<string, number>;
};

const formatMetricLabel = (label: string) => {
  return label.replace(/([A-Z])/g, " $1").trim();
};

export const MetricGrid = ({ metrics }: MetricGridProps) => {
  return (
    <div className="metric-grid">
      {Object.entries(metrics).map(([label, value]) => (
        <article className="metric-card" key={label}>
          <span>{formatMetricLabel(label)}</span>
          <strong>{value}</strong>
        </article>
      ))}
    </div>
  );
};