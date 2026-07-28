import { ROLE_LABELS, ROLE_COLORS } from '../../constants/roles';

const RoleBadge = ({ role }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] || ROLE_COLORS.participant}`}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
};

export default RoleBadge;
