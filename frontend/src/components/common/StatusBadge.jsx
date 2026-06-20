import Badge from './Badge';

const statusMap = {
  completed: { label: 'Completed', variant: 'success' },
  scheduled: { label: 'Scheduled', variant: 'info' },
  cancelled: { label: 'Cancelled', variant: 'danger' },
  missed: { label: 'Missed', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  ongoing: { label: 'Ongoing', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
  final: { label: 'Final', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  preliminary: { label: 'Preliminary', variant: 'info' },
};

export default function StatusBadge({ status }) {
  const config = statusMap[status] || { label: status, variant: 'default' };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
