"use client";

import Modal from "./Modal";

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
  const footer = (
    <>
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
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Team"
      footer={footer}
    >
      <p className="text-gray-700">
        Are you sure you want to delete the team &quot;{teamName}&quot;? This
        action cannot be undone.
      </p>
    </Modal>
  );
}
