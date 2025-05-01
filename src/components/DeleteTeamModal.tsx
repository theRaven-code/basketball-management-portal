"use client";

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  teamName: string;
}

export default function DeleteTeamModal({
  isOpen,
  onClose,
  onDelete,
  teamName,
}: DeleteTeamModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Delete Team</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete the team &quot;{teamName}&quot;? This
          action cannot be undone.
        </p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
