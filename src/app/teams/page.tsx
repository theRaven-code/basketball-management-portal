"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AddTeamModal from "@/components/AddTeamModal";
import TeamModal from "@/components/TeamModal";
import DeleteTeamModal from "@/components/DeleteTeamModal";
import { NBATeam } from "@balldontlie/sdk";
import { CustomTeam } from "@/types/context";

export default function TeamsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    teams,
    customTeams,
    isLoading,
    deleteTeam,
    players,
    playerTeams,
    updateTeam,
    updateNBATeam,
  } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<NBATeam | null>(null);
  const [selectedCustomTeam, setSelectedCustomTeam] = useState<string | null>(
    null
  );
  const [teamToDelete, setTeamToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const handleNBATeamUpdate = (
    teamId: string | number,
    data: Partial<NBATeam> | Partial<CustomTeam>
  ) => {
    if (typeof teamId === "number") {
      updateNBATeam(teamId, data as Partial<NBATeam>);
    }
  };

  const handleCustomTeamUpdate = (
    teamId: string | number,
    data: Partial<NBATeam> | Partial<CustomTeam>
  ) => {
    if (typeof teamId === "string") {
      updateTeam(teamId, data as Partial<CustomTeam>);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add New Team
        </button>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">NBA Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams?.map((team) => {
              // Find players assigned to this NBA team
              const assignedPlayers = players.filter(
                (player) => playerTeams[player.id] === team.id.toString()
              );
              return (
                <div
                  key={`nba-${team.id}`}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {team.full_name}
                      </h3>
                      <p className="text-gray-600">{team.city}</p>
                      <p className="text-sm text-gray-500">
                        {team.conference} Conference
                      </p>
                      <p className="text-sm text-blue-600 font-semibold mt-2">
                        Assigned Players: {assignedPlayers.length}
                      </p>
                      {assignedPlayers.length > 0 && (
                        <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                          {assignedPlayers.map((player) => (
                            <li key={player.id}>
                              {player.first_name} {player.last_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedTeam(team)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Custom Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTeams?.map((team) => {
              // Find players assigned to this custom team
              const assignedPlayers = players.filter(
                (player) => playerTeams[player.id] === team.id
              );
              return (
                <div
                  key={`custom-${team.id}`}
                  className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      <p className="text-gray-600">
                        {team.region}, {team.country}
                      </p>
                      <p className="text-sm text-blue-600 font-semibold mt-2">
                        Assigned Players: {assignedPlayers.length}
                      </p>
                      {assignedPlayers.length > 0 && (
                        <ul className="mt-1 text-sm text-gray-700 list-disc list-inside">
                          {assignedPlayers.map((player) => (
                            <li key={player.id}>
                              {player.first_name} {player.last_name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <button
                        onClick={() => setSelectedCustomTeam(team.id)}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setTeamToDelete({ id: team.id, name: team.name })
                        }
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <AddTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {selectedTeam && (
        <TeamModal
          isOpen={!!selectedTeam}
          onClose={() => setSelectedTeam(null)}
          team={selectedTeam}
          onUpdate={handleNBATeamUpdate}
          isNBATeam={true}
        />
      )}

      {selectedCustomTeam && (
        <TeamModal
          isOpen={!!selectedCustomTeam}
          onClose={() => setSelectedCustomTeam(null)}
          team={customTeams.find((t) => t.id === selectedCustomTeam)!}
          onUpdate={handleCustomTeamUpdate}
          isNBATeam={false}
        />
      )}

      {teamToDelete && (
        <DeleteTeamModal
          isOpen={!!teamToDelete}
          onClose={() => setTeamToDelete(null)}
          onDelete={() => deleteTeam(teamToDelete.id)}
          teamName={teamToDelete.name}
        />
      )}
    </div>
  );
}
