"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import AddTeamModal from "@/components/AddTeamModal";

export default function TeamsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { teams, customTeams, isLoading, deleteTeam, players, playerTeams } =
    useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
                  <h3 className="font-semibold text-lg">{team.full_name}</h3>
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
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="mt-4 text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete Team
                    </button>
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
    </div>
  );
}
