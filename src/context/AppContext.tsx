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

// Move cache outside AppProvider so it persists across renders
// const requestCache = new Map<string, Promise<void>>();

// Generate a stable ID based on team name and timestamp
const generateTeamId = (name: string) => {
  return `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
};

// Move inFlightCursors outside AppProvider so it persists
// const inFlightCursors = new Set<string | null>();

interface AppState {
  user: { id: string; email: string; name: string } | null;
  teams: NBATeam[];
  customTeams: CustomTeam[];
  players: Player[];
  playerTeams: Record<number, string>;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  nextCursor: number | null;
}

const initialState: AppState = {
  user: null,
  teams: [],
  customTeams: [],
  players: [],
  playerTeams: {},
  isLoading: false,
  error: null,
  hasMore: true,
  nextCursor: null,
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
      nextCursor:
        typeof parsed.nextCursor === "string" ? parsed.nextCursor : null,
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
      fetchPlayers();
      setIsInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const fetchPlayers = useCallback(async () => {
    if (state.isLoading) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await api.nba.getPlayers({
        per_page: 10,
        cursor:
          state.players.length > 0
            ? state.players[state.players.length - 1].id
            : undefined,
      });

      const newPlayers = response.data || [];

      // Create a Map to store unique players by ID
      const uniquePlayersMap = new Map(
        [...state.players, ...newPlayers].map((player) => [player.id, player])
      );

      // Convert Map values back to array
      const uniquePlayers = Array.from(uniquePlayersMap.values());

      setState((prev) => ({
        ...prev,
        players: uniquePlayers,
        isLoading: false,
        hasMore: !!response.meta?.next_cursor,
        nextCursor: response.meta?.next_cursor ?? null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to fetch players",
        isLoading: false,
      }));
      throw error;
    }
  }, [state.isLoading, state.nextCursor, state.players]);

  const loadMorePlayers = useCallback(() => {
    if (!state.isLoading && state.hasMore) {
      fetchPlayers();
    }
  }, [state.isLoading, state.hasMore, fetchPlayers]);

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

  const updateNBATeam = useCallback(
    (teamId: number, data: Partial<NBATeam>) => {
      setState((prev) => {
        const updatedTeams = prev.teams.map((team) =>
          team.id === teamId ? { ...team, ...data } : team
        );
        return {
          ...prev,
          teams: updatedTeams,
        };
      });
    },
    []
  );

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
        loadMorePlayers,
        addTeam,
        updateTeam,
        updateNBATeam,
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
