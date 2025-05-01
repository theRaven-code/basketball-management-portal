"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AppContextType, CustomTeam, Player } from "@/types/context";
import { BalldontlieAPI, NBATeam } from "@balldontlie/sdk";

const api = new BalldontlieAPI({
  apiKey: "fe3a6dfd-c831-4fd6-be76-8fb095221d0c",
});

// Generate a stable ID based on team name and timestamp
const generateTeamId = (name: string) => {
  return `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
};

interface AppState {
  user: { id: string; email: string; name: string } | null;
  teams: NBATeam[];
  customTeams: CustomTeam[];
  players: Player[];
  playerTeams: Record<number, string>; // Map of playerId to teamId
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

const initialState: AppState = {
  user: null,
  teams: [],
  customTeams: [],
  players: [],
  playerTeams: {}, // Map of playerId to teamId
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
};

// Load state from localStorage
const loadState = (): AppState => {
  if (typeof window === "undefined") return initialState;

  try {
    const savedState = localStorage.getItem("appState");
    if (!savedState) return initialState;

    const parsed = JSON.parse(savedState);
    return {
      ...initialState,
      ...parsed,
      customTeams: parsed.customTeams || [],
      teams: parsed.teams || [],
      players: parsed.players || [],
      playerTeams: parsed.playerTeams || {},
      user: parsed.user || null,
    };
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
    return initialState;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("appState", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [state]);

  // Initialize data on mount
  useEffect(() => {
    if (!isInitialized) {
      fetchTeams();
      fetchPlayers(1);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const login = async (username: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const mockUser = {
        id: "1",
        email: username,
        name: "Test User",
      };
      setState((prev) => ({ ...prev, user: mockUser, isLoading: false }));
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Login failed",
        isLoading: false,
      }));
    }
  };

  const logout = () => {
    setState((prev) => ({ ...prev, user: null }));
  };

  const fetchTeams = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.nba.getTeams();
      // Only update teams if we don't have them yet
      setState((prev) => ({
        ...prev,
        teams: prev.teams.length === 0 ? response.data || [] : prev.teams,
        isLoading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        error: "Failed to fetch teams",
        isLoading: false,
      }));
    }
  }, []);

  const fetchPlayers = useCallback(
    async (page: number = 1) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await api.nba.getPlayers({
          per_page: 25,
          cursor: (page - 1) * 25,
        });

        // Create a Set of existing player IDs for quick lookup
        const existingPlayerIds = new Set(state.players.map((p) => p.id));

        // Filter out any players that already exist in our list
        const newPlayers = (response.data || []).filter(
          (player) => !existingPlayerIds.has(player.id)
        );

        setState((prev) => ({
          ...prev,
          players: [...prev.players, ...newPlayers],
          isLoading: false,
          hasMore: (response.meta?.next_cursor || 0) > 0,
          currentPage: page,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          error: "Failed to fetch players",
          isLoading: false,
        }));
      }
    },
    [state.players]
  );

  const addTeam = useCallback((team: Omit<CustomTeam, "id" | "players">) => {
    setState((prev) => {
      const isNameUnique = !prev.customTeams.some(
        (t) => t.name.toLowerCase() === team.name.toLowerCase()
      );

      if (!isNameUnique) {
        throw new Error("Team name must be unique");
      }

      const newTeam: CustomTeam = {
        ...team,
        id: generateTeamId(team.name),
        players: [],
      };

      return {
        ...prev,
        customTeams: [...prev.customTeams, newTeam],
      };
    });
  }, []);

  const updateTeam = useCallback(
    (teamId: string, data: Partial<CustomTeam>) => {
      setState((prev) => {
        const teamIndex = prev.customTeams.findIndex(
          (team) => team.id === teamId
        );
        if (teamIndex === -1) {
          throw new Error("Team not found");
        }

        const existingTeam = prev.customTeams[teamIndex];

        // Check if name is being changed and if it's unique
        if (data.name && data.name !== existingTeam.name) {
          const isNameUnique = !prev.customTeams.some(
            (t) =>
              t.id !== teamId &&
              t.name.toLowerCase() === data.name!.toLowerCase()
          );

          if (!isNameUnique) {
            throw new Error("Team name must be unique");
          }
        }

        const updatedTeam = { ...existingTeam, ...data };
        const updatedTeams = [...prev.customTeams];
        updatedTeams[teamIndex] = updatedTeam;

        return {
          ...prev,
          customTeams: updatedTeams,
        };
      });
    },
    []
  );

  const deleteTeam = useCallback((teamId: string) => {
    setState((prev) => {
      const updatedTeams = prev.customTeams.filter(
        (team) => team.id !== teamId
      );
      const updatedPlayerTeams = { ...prev.playerTeams };

      // Remove team assignments for players that were on this team
      Object.entries(updatedPlayerTeams).forEach(
        ([playerId, assignedTeamId]) => {
          if (assignedTeamId === teamId) {
            delete updatedPlayerTeams[Number(playerId)];
          }
        }
      );

      return {
        ...prev,
        customTeams: updatedTeams,
        playerTeams: updatedPlayerTeams,
      };
    });
  }, []);

  const assignPlayerToTeam = useCallback((playerId: number, teamId: string) => {
    setState((prev) => {
      // First, unassign the player from any existing team
      const updatedPlayerTeams = { ...prev.playerTeams };
      delete updatedPlayerTeams[playerId];

      // Then assign to the new team
      updatedPlayerTeams[playerId] = teamId;

      return {
        ...prev,
        playerTeams: updatedPlayerTeams,
      };
    });
  }, []);

  const unassignPlayerFromTeam = useCallback((playerId: number) => {
    setState((prev) => {
      const updatedPlayerTeams = { ...prev.playerTeams };
      delete updatedPlayerTeams[playerId];

      return {
        ...prev,
        playerTeams: updatedPlayerTeams,
      };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuthenticated: !!state.user,
        login,
        logout,
        teams: state.teams,
        customTeams: state.customTeams,
        players: state.players,
        playerTeams: state.playerTeams,
        isLoading: state.isLoading,
        hasMore: state.hasMore,
        fetchTeams,
        fetchPlayers,
        loadMorePlayers: () => {
          if (!state.isLoading && state.hasMore) {
            fetchPlayers(state.currentPage + 1);
          }
        },
        addTeam,
        updateTeam,
        deleteTeam,
        assignPlayerToTeam,
        unassignPlayerFromTeam,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
