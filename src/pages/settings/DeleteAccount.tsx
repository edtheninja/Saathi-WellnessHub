import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { deleteLocalUserData } from "@/utils/deleteUserData";

const DeleteAccount = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleDelete = () => {
    deleteLocalUserData();
    navigate("/");
    window.location.reload(); // ensures clean reset
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-semibold text-destructive">
        Delete Local Data
      </h1>

      <p className="text-sm text-muted-foreground mt-2">
        This will remove all data stored on this device.
      </p>

      <Button
        variant="destructive"
        className="mt-6"
        onClick={() => setOpen(true)}
      >
        Delete My Data
      </Button>

      <DeleteConfirmModal
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default DeleteAccount;