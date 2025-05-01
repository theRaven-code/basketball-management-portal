"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Player, CustomTeam } from "@/types/context";
import { NBATeam } from "@balldontlie/sdk";
import InfiniteScroll from "react-infinite-scroll-component";

type TeamInfo = (NBATeam & { type: "nba" }) | (CustomTeam & { type: "custom" });

export default function PlayersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const {
    players,
    teams,
    customTeams,
    playerTeams,
    hasMore,
    loadMorePlayers,
    assignPlayerToTeam,
    unassignPlayerFromTeam,
  } = useApp();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const handleAssignPlayer = (teamId: string) => {
    if (!selectedPlayer) return;
    try {
      assignPlayerToTeam(selectedPlayer.id, teamId);
      setShowAssignmentModal(false);
      setSelectedPlayer(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to assign player");
    }
  };

  const handleUnassignPlayer = (playerId: number) => {
    try {
      unassignPlayerFromTeam(playerId);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to unassign player"
      );
    }
  };

  const getTeamInfo = (playerId: number): TeamInfo | null => {
    const teamId = playerTeams[playerId];
    if (!teamId) return null;

    const nbaTeam = teams.find((t) => t.id.toString() === teamId);
    if (nbaTeam) return { ...nbaTeam, type: "nba" };

    const customTeam = customTeams.find((t) => t.id === teamId);
    if (customTeam) return { ...customTeam, type: "custom" };

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Players</h1>

      <InfiniteScroll
        dataLength={players.length}
        next={loadMorePlayers}
        hasMore={hasMore}
        loader={
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        }
        endMessage={
          <p className="text-center text-gray-500 py-4">
            No more players to load
          </p>
        }
      >
        <div className="space-y-4">
          {players.map((player) => {
            const team = getTeamInfo(player.id);
            return (
              <div
                key={player.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {player.first_name} {player.last_name}
                    </h3>
                    <p className="text-gray-600">
                      Position: {player.position || "N/A"}
                    </p>
                    {team && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Team:{" "}
                          {team.type === "nba" ? team.full_name : team.name}
                        </p>
                        <button
                          onClick={() => handleUnassignPlayer(player.id)}
                          className="text-red-500 text-sm hover:text-red-700"
                        >
                          Unassign
                        </button>
                      </div>
                    )}
                  </div>
                  {!team && (
                    <button
                      onClick={() => {
                        setSelectedPlayer(player);
                        setShowAssignmentModal(true);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Assign to Team
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>

      {showAssignmentModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Assign {selectedPlayer.first_name} {selectedPlayer.last_name} to
              Team
            </h2>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <h3 className="font-medium">NBA Teams</h3>
              {teams.map((team) => (
                <button
                  key={`nba-${team.id}`}
                  onClick={() => handleAssignPlayer(team.id.toString())}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  {team.full_name}
                </button>
              ))}

              <h3 className="font-medium mt-4">Custom Teams</h3>
              {customTeams.map((team) => (
                <button
                  key={`custom-${team.id}`}
                  onClick={() => handleAssignPlayer(team.id)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded"
                >
                  {team.name}
                </button>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowAssignmentModal(false);
                  setSelectedPlayer(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
