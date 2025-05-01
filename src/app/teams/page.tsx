"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import AddTeamModal from "@/components/AddTeamModal";
import EditTeamModal from "@/components/EditTeamModal";
import { CustomTeam } from "@/types/context";

export default function TeamsPage() {
  const { teams, customTeams, fetchTeams, isLoading, deleteTeam, updateTeam } =
    useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<CustomTeam | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchTeams();
  }, [fetchTeams]);

  const handleEditClick = (team: CustomTeam) => {
    setSelectedTeam(team);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeam = (teamId: string, data: Partial<CustomTeam>) => {
    updateTeam(teamId, data);
    setIsEditModalOpen(false);
  };

  if (!mounted) {
    return null;
  }

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
            {teams?.map((team) => (
              <div
                key={`nba-${team.id}`}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg">{team.full_name}</h3>
                <p className="text-gray-600">{team.city}</p>
                <p className="text-sm text-gray-500">
                  {team.conference} Conference
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Custom Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTeams?.map((team) => (
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
                    <p className="text-sm text-gray-500">
                      {team.players.length} players
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(team)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AddTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {selectedTeam && (
        <EditTeamModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          team={selectedTeam}
          onUpdate={handleUpdateTeam}
        />
      )}
    </div>
  );
}
