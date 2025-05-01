import { CustomTeam } from "@/types/context";

export interface TeamValidationErrors {
  name?: string;
  region?: string;
  general?: string;
}

export const validateTeamForm = (
  formData: { name: string; region: string },
  customTeams: CustomTeam[],
  existingTeamName?: string
): TeamValidationErrors => {
  const errors: TeamValidationErrors = {};

  // Name validation
  if (!formData.name.trim()) {
    errors.name = "Team name is required";
  } else if (formData.name.length < 3) {
    errors.name = "Team name must be at least 3 characters long";
  } else if (
    customTeams.some(
      (team) =>
        team.name.toLowerCase() === formData.name.toLowerCase() &&
        team.name !== existingTeamName
    )
  ) {
    errors.name = "Team name must be unique";
  }

  // Region validation
  if (!formData.region.trim()) {
    errors.region = "Region is required";
  } else if (formData.region.length < 2) {
    errors.region = "Region must be at least 2 characters long";
  }

  return errors;
};
