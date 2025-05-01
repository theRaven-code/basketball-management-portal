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
  const {
    players,
    playerTeams,
    assignPlayerToTeam,
    unassignPlayerFromTeam,
    customTeams,
  } = useApp();
  const [formData, setFormData] = useState({
    name: team.name,
    region: isNBATeam ? (team as NBATeam).city : (team as CustomTeam).region,
    country: "America",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    region?: string;
    general?: string;
  }>({});
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
      setErrors({});
    }
  }, [isOpen, team, isNBATeam]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Team name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Team name must be at least 3 characters long";
    } else if (!isNBATeam && formData.name !== team.name) {
      const isNameUnique = !customTeams.some(
        (t) =>
          t.id !== team.id &&
          t.name.toLowerCase() === formData.name.toLowerCase()
      );
      if (!isNameUnique) {
        newErrors.name = "Team name must be unique";
      }
    }

    // Region validation
    if (!formData.region.trim()) {
      newErrors.region = "Region is required";
    } else if (formData.region.length < 2) {
      newErrors.region = "Region must be at least 2 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

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
      setErrors({
        general: err instanceof Error ? err.message : "Failed to update team",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time validation for team name
    if (name === "name") {
      const newErrors = { ...errors };
      if (!value.trim()) {
        newErrors.name = "Team name is required";
      } else if (value.length < 3) {
        newErrors.name = "Team name must be at least 3 characters long";
      } else if (!isNBATeam && value !== team.name) {
        const isNameUnique = !customTeams.some(
          (t) =>
            t.id !== team.id && t.name.toLowerCase() === value.toLowerCase()
        );
        if (!isNameUnique) {
          newErrors.name = "Team name must be unique";
        } else {
          delete newErrors.name;
        }
      } else {
        delete newErrors.name;
      }
      setErrors(newErrors);
    } else if (name === "region") {
      const newErrors = { ...errors };
      if (!value.trim()) {
        newErrors.region = "Region is required";
      } else if (value.length < 2) {
        newErrors.region = "Region must be at least 2 characters long";
      } else {
        delete newErrors.region;
      }
      setErrors(newErrors);
    }
  };

  const handleUnassignPlayer = (playerId: number) => {
    try {
      unassignPlayerFromTeam(playerId);
    } catch (err) {
      setErrors({
        general:
          err instanceof Error ? err.message : "Failed to unassign player",
      });
    }
  };

  const handleAssignPlayer = (playerId: number) => {
    try {
      assignPlayerToTeam(playerId, team.id.toString());
      setShowAddPlayerModal(false);
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Failed to assign player",
      });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">
              Edit {isNBATeam ? "NBA" : ""} Team
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {errors.general && (
            <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-xs sm:text-sm">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  readOnly={isNBATeam}
                  className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                    errors.name
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } ${isNBATeam ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder="Enter team name"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {isNBATeam ? "City" : "Region"}
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  readOnly={isNBATeam}
                  className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${
                    errors.region
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  } ${isNBATeam ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  placeholder={`Enter ${isNBATeam ? "city" : "region"}`}
                />
                {errors.region && (
                  <p className="mt-1 text-xs text-red-600">{errors.region}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  readOnly={isNBATeam}
                  className={`w-full px-2 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 ${"border-gray-300 focus:ring-blue-500"} ${
                    isNBATeam ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  placeholder="Enter country"
                />
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-medium">
                  Assigned Players
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(true)}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Player
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {assignedPlayers.length > 0 ? (
                  assignedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-1.5 bg-gray-50 rounded"
                    >
                      <span className="text-xs sm:text-sm truncate flex-1">
                        {player.first_name} {player.last_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUnassignPlayer(player.id)}
                        className="ml-2 text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">
                    No players assigned
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-3">
              <button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base sm:text-lg font-semibold">
                  Add Player to Team
                </h3>
                <button
                  onClick={() => setShowAddPlayerModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {unassignedPlayers.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No unassigned players available
                  </p>
                ) : (
                  unassignedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-1.5 bg-gray-50 rounded"
                    >
                      <span className="text-xs sm:text-sm truncate flex-1">
                        {player.first_name} {player.last_name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAssignPlayer(player.id)}
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
