import { NBATeam, NBAPlayer } from "@balldontlie/sdk";

export interface Player extends NBAPlayer {
  teamId?: string;
}

export interface Team {
  id: number;
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  full_name: string;
  name: string;
}

export interface CustomTeam {
  id: string;
  name: string;
  region: string;
  country: string;
  players: Player[];
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AppState {
  user: User | null;
  teams: Team[]; // NBA teams from the API
  customTeams: CustomTeam[];
  players: Player[]; // Players from the API
  playerTeams: Record<number, string>; // Map of playerId to teamId
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

export interface AppContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  teams: NBATeam[];
  customTeams: CustomTeam[];
  players: Player[];
  playerTeams: Record<number, string>;
  isLoading: boolean;
  hasMore: boolean;
  fetchTeams: () => Promise<void>;
  fetchPlayers: (cursor?: string | null) => Promise<void>;
  loadMorePlayers: () => void;
  addTeam: (team: Omit<CustomTeam, "id" | "players">) => void;
  updateTeam: (teamId: string, data: Partial<CustomTeam>) => void;
  updateNBATeam: (teamId: number, data: Partial<NBATeam>) => void;
  deleteTeam: (teamId: string) => void;
  assignPlayerToTeam: (playerId: number, teamId: string) => void;
  unassignPlayerFromTeam: (playerId: number) => void;
}
