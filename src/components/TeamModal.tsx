"use client";

import { useState, useEffect } from "react";
import { NBATeam } from "@balldontlie/sdk";
import { CustomTeam } from "@/types/context";
import { useApp } from "@/context/AppContext";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: NBATeam | CustomTeam;
  onUpdate: (
    teamId: string | number,
    data: Partial<NBATeam> | Partial<CustomTeam>
  ) => void;
  isNBATeam?: boolean;
}

export default function TeamModal({
  isOpen,
  onClose,
  team,
  onUpdate,
  isNBATeam = false,
}: TeamModalProps) {
  const { players, playerTeams, assignPlayerToTeam, unassignPlayerFromTeam } =
    useApp();
  const [formData, setFormData] = useState({
    name: team.name,
    region: isNBATeam ? (team as NBATeam).city : (team as CustomTeam).region,
    country: "America",
  });
  const [error, setError] = useState<string | null>(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: team.name,
        region: isNBATeam
          ? (team as NBATeam).city
          : (team as CustomTeam).region,
        country: "America",
      });
      setError(null);
    }
  }, [isOpen, team, isNBATeam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isNBATeam) {
        const nbaTeam = team as NBATeam;
        onUpdate(nbaTeam.id, { name: formData.name, city: formData.region });
      } else {
        const customTeam = team as CustomTeam;
        onUpdate(customTeam.id, {
          name: formData.name,
          region: formData.region,
          country: formData.country,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update team");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnassignPlayer = (playerId: number) => {
    try {
      unassignPlayerFromTeam(playerId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to unassign player"
      );
    }
  };

  const handleAssignPlayer = (playerId: number) => {
    try {
      assignPlayerToTeam(playerId, team.id.toString());
      setShowAddPlayerModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign player");
    }
  };

  // Get players assigned to this team
  const assignedPlayers = players.filter(
    (player) => playerTeams[player.id] === team.id.toString()
  );

  // Get unassigned players
  const unassignedPlayers = players.filter((player) => !playerTeams[player.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">
          Edit {isNBATeam ? "NBA" : ""} Team
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isNBATeam ? "City" : "Region"}
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              readOnly
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Assigned Players ({assignedPlayers.length})
              </label>
              <button
                type="button"
                onClick={() => setShowAddPlayerModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Add Player
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2">
              {assignedPlayers.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No players assigned to this team
                </p>
              ) : (
                <ul className="space-y-2">
                  {assignedPlayers.map((player) => (
                    <li
                      key={player.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">
                        {player.first_name} {player.last_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUnassignPlayer(player.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Unassign
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Team
            </button>
          </div>
        </form>

        {showAddPlayerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Add Player to Team</h3>
              <div className="max-h-60 overflow-y-auto">
                {unassignedPlayers.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No unassigned players available
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {unassignedPlayers.map((player) => (
                      <li
                        key={player.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm">
                          {player.first_name} {player.last_name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAssignPlayer(player.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
