import React from "react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<Props> = ({ open, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h2 className="text-lg font-semibold text-destructive">
          Delete Account?
        </h2>

        <p className="text-sm text-muted-foreground mt-2">
          This will permanently delete your data. This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={onConfirm}>
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;