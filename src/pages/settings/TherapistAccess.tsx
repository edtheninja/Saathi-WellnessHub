import React, { useState } from "react";

const THERAPIST_PHONE = "+919999999999"; // replace with real number
const THERAPIST_EMAIL = "support@saathi.app";

const TherapistAccess: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(
    localStorage.getItem("therapistAccess") === "true"
  );

  const toggleAccess = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem("therapistAccess", String(newValue));
  };

  const callTherapist = () => {
    window.location.href = `tel:${THERAPIST_PHONE}`;
  };

  const emailTherapist = () => {
    window.location.href = `mailto:${THERAPIST_EMAIL}`;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Therapist Access</h2>

      <p className="text-sm text-muted-foreground">
        You can choose to connect with a certified mental health professional
        for emotional support and guidance.
      </p>

      {/* Access Toggle */}
      <div className="flex items-center justify-between border rounded-lg p-4">
        <div>
          <p className="font-medium">Allow Therapist Access</p>
          <p className="text-xs text-muted-foreground">
            Enables therapist communication and support.
          </p>
        </div>

        <input
          type="checkbox"
          checked={enabled}
          onChange={toggleAccess}
          className="w-5 h-5"
        />
      </div>

      {/* Contact Options */}
      {enabled && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="font-medium mb-2">Contact Therapist</p>

            <button
              onClick={callTherapist}
              className="w-full bg-green-600 text-white py-2 rounded mb-2"
            >
              📞 Call Therapist
            </button>

            <button
              onClick={emailTherapist}
              className="w-full border py-2 rounded"
            >
              ✉️ Email Therapist
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            Availability depends on therapist schedule. This service does not
            replace emergency care.
          </p>
        </div>
      )}

      {/* Emergency Note */}
      <div className="border border-red-300 bg-red-50 p-4 rounded-lg text-sm">
        <p className="font-medium text-red-700">Emergency Notice</p>
        <p className="text-red-600">
          If you are in immediate danger, please contact local emergency services
          or call <strong>112</strong>.
        </p>
      </div>
    </div>
  );
};

export default TherapistAccess;
