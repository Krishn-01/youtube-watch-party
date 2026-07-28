import { useState } from 'react';

import RoleBadge from './RoleBadge';

import { ROLES, canManageRoles } from '../../constants/roles';



const ParticipantList = ({

  participants,

  currentOdId,

  hostOdId,

  userRole,

  onAssignRole,

  onTransferHost,

  onRemove,

}) => {

  const [actionLoading, setActionLoading] = useState(null);

  const canManage = canManageRoles(userRole);



  const handleAction = async (action, targetOdId, role) => {

    setActionLoading(targetOdId);

    try {

      if (action === 'assign') {

        await onAssignRole(targetOdId, role);

      } else if (action === 'transfer') {

        await onTransferHost(targetOdId);

      } else if (action === 'remove') {

        await onRemove(targetOdId);

      }

    } finally {

      setActionLoading(null);

    }

  };



  const sortedParticipants = [...participants].sort((a, b) => {

    const order = { host: 0, moderator: 1, participant: 2 };

    return (order[a.role] ?? 3) - (order[b.role] ?? 3);

  });



  return (

    <div className="card h-full">

      <div className="mb-4 flex items-center justify-between">

        <h2 className="text-sm font-semibold text-gray-200">

          Participants

        </h2>

        <span className="rounded-full bg-surface-700 px-2.5 py-0.5 text-xs text-gray-400">

          {participants.length}

        </span>

      </div>



      <ul className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">

        {sortedParticipants.map((participant) => {

          const isSelf = participant.odId === currentOdId;

          const isRoomHost = participant.odId === hostOdId;



          return (

            <li

              key={participant.odId}

              className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${

                isSelf

                  ? 'border-brand-500/30 bg-brand-500/5'

                  : 'border-surface-600 bg-surface-700/50'

              }`}

            >

              <div className="flex items-center gap-2.5 min-w-0">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-600 text-xs font-bold uppercase">

                  {participant.name.charAt(0)}

                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-medium">

                    {participant.name}

                    {isSelf && (

                      <span className="ml-1 text-xs text-gray-500">(you)</span>

                    )}

                  </p>

                  <RoleBadge role={participant.role} />

                </div>

              </div>



              {canManage && !isSelf && (

                <div className="flex shrink-0 gap-1 ml-2">

                  {participant.role === ROLES.PARTICIPANT && (

                    <button

                      onClick={() =>

                        handleAction('assign', participant.odId, ROLES.MODERATOR)

                      }

                      disabled={actionLoading === participant.odId}

                      className="rounded px-2 py-1 text-xs text-blue-400 hover:bg-blue-500/10 disabled:opacity-50"

                      title="Promote to Moderator"

                    >

                      Mod

                    </button>

                  )}



                  {participant.role === ROLES.MODERATOR && (

                    <button

                      onClick={() =>

                        handleAction('assign', participant.odId, ROLES.PARTICIPANT)

                      }

                      disabled={actionLoading === participant.odId}

                      className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-500/10 disabled:opacity-50"

                      title="Demote to Participant"

                    >

                      Demote

                    </button>

                  )}



                  {!isRoomHost && (

                    <>

                      <button

                        onClick={() => handleAction('transfer', participant.odId)}

                        disabled={actionLoading === participant.odId}

                        className="rounded px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10 disabled:opacity-50"

                        title="Transfer Host"

                      >

                        Host

                      </button>

                      <button

                        onClick={() => handleAction('remove', participant.odId)}

                        disabled={actionLoading === participant.odId}

                        className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-50"

                        title="Remove Participant"

                      >

                        Remove

                      </button>

                    </>

                  )}

                </div>

              )}

            </li>

          );

        })}

      </ul>

    </div>

  );

};



export default ParticipantList;

