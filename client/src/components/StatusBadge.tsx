type StatusBadgeProps = {
  status: string;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return <span className={`status-badge status-${status}`}>{status}</span>;
};