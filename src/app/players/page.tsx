"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { NBATeam } from "@balldontlie/sdk";
import { Player } from "@/types/context";

export default function PlayersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    players,
    isLoading,
    hasMore,
    loadMorePlayers,
    playerTeams,
    assignPlayerToTeam,
    unassignPlayerFromTeam,
    customTeams,
    teams,
  } = useApp();

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePlayers();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMorePlayers]);

  const handleAssignClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowAssignModal(true);
  };

  const handleUnassignClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowUnassignModal(true);
  };

  const handleAssign = (teamId: string) => {
    if (selectedPlayer) {
      assignPlayerToTeam(selectedPlayer.id, teamId);
      setShowAssignModal(false);
      setSelectedPlayer(null);
    }
  };

  const handleUnassign = () => {
    if (selectedPlayer) {
      unassignPlayerFromTeam(selectedPlayer.id);
      setShowUnassignModal(false);
      setSelectedPlayer(null);
    }
  };

  const allTeams = [
    { id: "all", name: "All Teams" },
    ...teams.map((team: NBATeam) => ({
      id: team.id.toString(),
      name: team.full_name,
    })),
    ...customTeams.map((team) => ({
      id: team.id.toString(),
      name: team.name,
    })),
  ];

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Players</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {players.map((player) => (
          <div
            key={player.id}
            className="bg-white rounded-lg shadow-md p-4 md:p-6 space-y-4 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {player.first_name} {player.last_name}
                </h3>
                <p className="text-gray-600">{player.position}</p>
              </div>
              <div className="flex space-x-2">
                {playerTeams[player.id] ? (
                  <button
                    onClick={() => handleUnassignClick(player)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                  >
                    Unassign
                  </button>
                ) : (
                  <button
                    onClick={() => handleAssignClick(player)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                  >
                    Assign
                  </button>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {playerTeams[player.id] ? (
                <p>
                  Assigned to:{" "}
                  {allTeams.find((t) => t.id === playerTeams[player.id])?.name}
                </p>
              ) : (
                <p>Not assigned to any team</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={observerTarget} className="h-10" />

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {showAssignModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Assign Player to Team
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allTeams
                .filter((team) => team.id !== "all")
                .map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleAssign(team.id)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-md transition-colors duration-200"
                  >
                    {team.name}
                  </button>
                ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPlayer(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showUnassignModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Unassign Player</h3>
            <p className="mb-4">
              Are you sure you want to unassign {selectedPlayer.first_name}{" "}
              {selectedPlayer.last_name} from their current team?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowUnassignModal(false);
                  setSelectedPlayer(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUnassign}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Unassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
