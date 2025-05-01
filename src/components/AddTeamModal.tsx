"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTeamModal({ isOpen, onClose }: AddTeamModalProps) {
  const { addTeam, customTeams } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    country: "America",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    region?: string;
    general?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: "", region: "", country: "America" });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Team name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Team name must be at least 3 characters long";
    } else if (
      customTeams.some(
        (team) => team.name.toLowerCase() === formData.name.toLowerCase()
      )
    ) {
      newErrors.name = "Team name must be unique";
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
      addTeam(formData);
      onClose();
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Failed to create team",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation for team name
    if (name === "name") {
      const newErrors = { ...errors };
      if (!value.trim()) {
        newErrors.name = "Team name is required";
      } else if (value.length < 3) {
        newErrors.name = "Team name must be at least 3 characters long";
      } else if (
        customTeams.some(
          (team) => team.name.toLowerCase() === value.toLowerCase()
        )
      ) {
        newErrors.name = "Team name must be unique";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border-2 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Add New Team</h2>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Team Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.name
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="Enter team name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="region"
              className="block text-sm font-medium text-gray-700"
            >
              Region
            </label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.region
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="Enter region"
            />
            {errors.region && (
              <p className="mt-1 text-sm text-red-600">{errors.region}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-100"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!errors.name || !!errors.region}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                errors.name || errors.region
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
