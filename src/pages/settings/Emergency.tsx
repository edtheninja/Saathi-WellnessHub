<<<<<<< HEAD
=======
import { useMemo, useState } from "react";
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
import {
  AlertTriangle,
  Baby,
  HeartHandshake,
<<<<<<< HEAD
  Phone,
  ShieldAlert,
  Stethoscope,
  UserRound,
=======
  Pencil,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRound,
  Users,
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
=======
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4

const callNumber = (number: string) => {
  window.location.href = `tel:${number}`;
};

<<<<<<< HEAD
=======
type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: number;
};

>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
type SupportOptionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  number: string;
  actionLabel: string;
  urgent?: boolean;
};

const SupportOption = ({
  icon,
  title,
  description,
  number,
  actionLabel,
  urgent = false,
}: SupportOptionProps) => {
  return (
    <Card
      className={`border shadow-sm ${
        urgent
          ? "border-red-500/30 bg-red-500/[0.04]"
          : "border-border/50 bg-card"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              urgent ? "bg-red-500/10" : "bg-primary/10"
            }`}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold text-foreground">{title}</h2>

              {urgent && (
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                  Immediate
                </span>
              )}
            </div>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                onClick={() => callNumber(number)}
                className={`h-11 gap-2 ${
                  urgent
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : ""
                }`}
              >
                <Phone className="h-4 w-4" />
                {actionLabel}
              </Button>

              <span className="text-sm font-semibold text-muted-foreground">
                {number}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

<<<<<<< HEAD
const Emergency = () => {
=======
const relationshipOptions = [
  "Mother",
  "Father",
  "Parent",
  "Sibling",
  "Partner",
  "Friend",
  "Relative",
  "Other",
];

const Emergency = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingContact, setEditingContact] =
    useState<EmergencyContact | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  const primaryContact = useMemo(
    () => contacts.find((contact) => contact.priority === 1),
    [contacts]
  );

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      relationship: "",
    });
  };

  const openAddContact = () => {
    setEditingContact(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);

    setForm({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    });

    setIsDialogOpen(true);
  };

  const handleSaveContact = () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const relationship = form.relationship.trim();

    if (name.length < 2 || !phone || !relationship) {
      return;
    }

    if (editingContact) {
      setContacts((current) =>
        current.map((contact) =>
          contact.id === editingContact.id
            ? {
                ...contact,
                name,
                phone,
                relationship,
              }
            : contact
        )
      );
    } else {
      const nextPriority =
        contacts.length === 0 ? 1 : contacts.length + 1;

      const newContact: EmergencyContact = {
        id: crypto.randomUUID(),
        name,
        phone,
        relationship,
        priority: nextPriority,
      };

      setContacts((current) => [...current, newContact]);
    }

    setIsDialogOpen(false);
    resetForm();
    setEditingContact(null);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((current) =>
      current
        .filter((contact) => contact.id !== id)
        .sort((a, b) => a.priority - b.priority)
        .map((contact, index) => ({
          ...contact,
          priority: index + 1,
        }))
    );
  };

  const setHighestPriority = (id: string) => {
    setContacts((current) => {
      const selected = current.find((contact) => contact.id === id);

      if (!selected || selected.priority === 1) {
        return current;
      }

      return current
        .map((contact) => {
          if (contact.id === id) {
            return {
              ...contact,
              priority: 1,
            };
          }

          return {
            ...contact,
            priority: contact.priority < selected.priority
              ? contact.priority + 1
              : contact.priority,
          };
        })
        .sort((a, b) => a.priority - b.priority);
    });
  };

  const moveContactUp = (id: string) => {
    setContacts((current) => {
      const sorted = [...current].sort(
        (a, b) => a.priority - b.priority
      );

      const index = sorted.findIndex((contact) => contact.id === id);

      if (index <= 0) {
        return sorted;
      }

      const previous = sorted[index - 1];
      const currentContact = sorted[index];

      sorted[index - 1] = {
        ...currentContact,
        priority: previous.priority,
      };

      sorted[index] = {
        ...previous,
        priority: currentContact.priority,
      };

      return sorted.sort((a, b) => a.priority - b.priority);
    });
  };

  const moveContactDown = (id: string) => {
    setContacts((current) => {
      const sorted = [...current].sort(
        (a, b) => a.priority - b.priority
      );

      const index = sorted.findIndex((contact) => contact.id === id);

      if (index === -1 || index >= sorted.length - 1) {
        return sorted;
      }

      const next = sorted[index + 1];
      const currentContact = sorted[index];

      sorted[index] = {
        ...next,
        priority: currentContact.priority,
      };

      sorted[index + 1] = {
        ...currentContact,
        priority: next.priority,
      };

      return sorted.sort((a, b) => a.priority - b.priority);
    });
  };

>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-6 pb-32">
      {/* Emergency header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Emergency Help
            </h1>
<<<<<<< HEAD
=======

>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
            <p className="text-sm text-muted-foreground">
              Quick access to the right support.
            </p>
          </div>
        </div>
      </div>

      {/* Highest priority action */}
      <Card className="overflow-hidden border-red-500/30 bg-red-500/[0.05] shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                If there is immediate danger
              </p>

              <h2 className="mt-1 text-xl font-bold text-foreground">
                Call 112 now
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                If you or someone else is in immediate danger, seriously
                injured, or needs urgent emergency assistance, do not wait
                here. Call emergency services.
              </p>

              <Button
                type="button"
                onClick={() => callNumber("112")}
                className="mt-5 h-12 w-full gap-2 bg-red-600 text-base font-semibold text-white hover:bg-red-700 sm:w-auto sm:px-8"
              >
                <Phone className="h-5 w-5" />
                Call 112
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

<<<<<<< HEAD
=======
      {/* Emergency contacts */}
      <Card className="border-border/50 bg-card shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    My Emergency Contacts
                  </h2>

                  {contacts.length > 0 && (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {contacts.length}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Choose who Saathi should contact first during an SOS.
                </p>
              </div>
            </div>

            <Button
              type="button"
              onClick={openAddContact}
              className="h-10 gap-2 sm:shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>

          {/* Primary contact info */}
          {primaryContact && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.05] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Primary contact: {primaryContact.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This person has the highest priority and will be contacted
                  first when the SOS feature is activated.
                </p>
              </div>
            </div>
          )}

          {/* Empty state */}
          {contacts.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-3 font-semibold text-foreground">
                No emergency contacts yet
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
                Add trusted friends or family members who can be contacted
                when you need help.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={openAddContact}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Contact
              </Button>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {[...contacts]
                .sort((a, b) => a.priority - b.priority)
                .map((contact, index) => {
                  const isPrimary = contact.priority === 1;

                  return (
                    <div
                      key={contact.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        isPrimary
                          ? "border-primary/30 bg-primary/[0.04]"
                          : "border-border/50 bg-background"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Priority */}
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            isPrimary
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {contact.priority}
                        </div>

                        {/* Contact information */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-foreground">
                              {contact.name}
                            </h3>

                            {isPrimary && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                <ShieldCheck className="h-3 w-3" />
                                Primary
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {contact.relationship}
                          </p>

                          <p className="mt-1 text-sm font-medium text-foreground">
                            {contact.phone}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => callNumber(contact.phone)}
                              className="h-9 gap-1.5"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Call
                            </Button>

                            {!isPrimary && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setHighestPriority(contact.id)
                                }
                                className="h-9 gap-1.5"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Make Primary
                              </Button>
                            )}

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditContact(contact)}
                              className="h-9 gap-1.5"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteContact(contact.id)
                              }
                              className="h-9 gap-1.5 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>

                          {/* Reordering */}
                          {contacts.length > 1 && (
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Priority
                              </span>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={index === 0}
                                onClick={() =>
                                  moveContactUp(contact.id)
                                }
                                className="h-7 px-2 text-xs"
                              >
                                ↑ Move up
                              </Button>

                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={
                                  index === contacts.length - 1
                                }
                                onClick={() =>
                                  moveContactDown(contact.id)
                                }
                                className="h-7 px-2 text-xs"
                              >
                                ↓ Move down
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {contacts.length > 0 && (
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              You control the order. Priority 1 is the person Saathi should
              try first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
            </DialogTitle>

            <DialogDescription>
              Add someone you trust who can be contacted when you need
              emergency support.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="emergency-contact-name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>

              <input
                id="emergency-contact-name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Mom"
                autoComplete="name"
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label
                htmlFor="emergency-contact-phone"
                className="text-sm font-medium text-foreground"
              >
                Phone number
              </label>

              <input
                id="emergency-contact-phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                placeholder="e.g. +91 98765 43210"
                autoComplete="tel"
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <label
                htmlFor="emergency-contact-relationship"
                className="text-sm font-medium text-foreground"
              >
                Relationship
              </label>

              <select
                id="emergency-contact-relationship"
                value={form.relationship}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    relationship: event.target.value,
                  }))
                }
                className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>
                  Select relationship
                </option>

                {relationshipOptions.map((relationship) => (
                  <option key={relationship} value={relationship}>
                    {relationship}
                  </option>
                ))}
              </select>
            </div>

            {!editingContact && (
              <div className="rounded-xl bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">
                This contact will be added to the end of your priority list.
                You can change their priority after saving.
              </div>
            )}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSaveContact}
              disabled={
                form.name.trim().length < 2 ||
                !form.phone.trim() ||
                !form.relationship
              }
              className="w-full sm:w-auto"
            >
              {editingContact ? "Save Changes" : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
      {/* Quick decision */}
      <div className="pt-2">
        <h2 className="text-lg font-semibold text-foreground">
          What kind of help do you need?
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Choose the closest match. If you are unsure, call 112.
        </p>
      </div>

      {/* Physical / medical */}
      <SupportOption
        icon={<Stethoscope className="h-5 w-5 text-primary" />}
        title="Physical injury or medical emergency"
        description="For serious injury, illness, unconsciousness, severe pain, or another situation requiring urgent medical assistance."
        number="112"
        actionLabel="Call Emergency Services"
      />

      {/* Mental health */}
      <SupportOption
        icon={<HeartHandshake className="h-5 w-5 text-primary" />}
        title="Mental or emotional distress"
        description="For overwhelming distress, emotional crisis, thoughts of self-harm, or when you need immediate mental-health support."
        number="14416"
        actionLabel="Call Tele-MANAS"
      />

      {/* Women */}
      <SupportOption
        icon={<UserRound className="h-5 w-5 text-primary" />}
        title="Woman facing violence or safety concerns"
        description="For women experiencing violence, abuse, harassment, or a situation where safety and support are needed."
        number="181"
        actionLabel="Call Women Helpline"
      />

      {/* Children */}
      <SupportOption
        icon={<Baby className="h-5 w-5 text-primary" />}
        title="Child or minor in danger"
        description="For a child who is unsafe, being harmed, missing, abandoned, or otherwise in need of protection and support."
        number="1098"
        actionLabel="Call Child Helpline"
      />

      {/* Unsure */}
      <Card className="border-0 bg-muted/40 shadow-none">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />

            <div>
              <p className="font-semibold text-foreground">
                Not sure which option applies?
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                You do not need to figure everything out before asking for
                help. If there is immediate risk or you are unsure what to do,
                call 112 and explain what is happening.
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => callNumber("112")}
                className="mt-4 gap-2"
              >
                <Phone className="h-4 w-4" />
                Call 112
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final safety note */}
      <div className="rounded-2xl border border-border/50 bg-card p-4">
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Saathi provides quick access to support services but does not replace
          emergency responders, doctors, mental-health professionals, police,
          child-protection services, or other authorities.
        </p>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default Emergency;
=======
export default Emergency;
>>>>>>> 893c62c9aa64bc8a6b882deeca130f0db3a0fdf4
