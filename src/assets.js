export const seedAssets = [
  { id: 'PC-001', name: 'MacBook Pro 14', brand: 'Apple', assignee: 'Design team', location: 'Riyadh · Floor 2', status: 'Assigned', purchased: '2026-09-01' },
  { id: 'PC-002', name: 'ThinkPad X1 Carbon', brand: 'Lenovo', assignee: 'Engineering', location: 'Riyadh · Floor 3', status: 'Assigned', purchased: '2026-08-12' },
  { id: 'PC-003', name: 'OptiPlex 7020', brand: 'Dell', assignee: '', location: 'Equipment room', status: 'Available', purchased: '2026-07-20' },
  { id: 'PC-004', name: 'EliteBook 840', brand: 'HP', assignee: 'IT support', location: 'Service desk', status: 'Maintenance', purchased: '2026-06-15' },
  { id: 'PC-005', name: 'Mac mini', brand: 'Apple', assignee: '', location: 'Equipment room', status: 'Available', purchased: '2026-09-10' },
];
export const statuses = ['Available', 'Assigned', 'Maintenance', 'Retired'];
export const blankAsset = { id: '', name: '', brand: '', assignee: '', location: '', status: 'Available', purchased: '' };
export function validateAsset(asset, assets, originalId = null) {
  if (!asset.id.trim() || !asset.name.trim() || !asset.brand.trim() || !asset.location.trim()) return 'Complete all required fields.';
  if (assets.some(item => item.id !== originalId && item.id.toLowerCase() === asset.id.trim().toLowerCase())) return 'This asset ID already exists.';
  if (!statuses.includes(asset.status)) return 'Choose a valid status.';
  if (asset.status === 'Assigned' && !asset.assignee.trim()) return 'Assigned computers need an assignee.';
  return '';
}
export function searchAssets(assets, query, status = 'All') {
  const needle = query.trim().toLowerCase();
  return assets.filter(asset => (status === 'All' || asset.status === status) && Object.values(asset).some(value => value.toLowerCase().includes(needle)));
}
