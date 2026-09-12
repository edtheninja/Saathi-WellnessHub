import { useNavigate } from "react-router-dom";

export default function DeviceCard() {

  const navigate = useNavigate();

  return (
    <div className="rounded-[28px] border bg-card p-6">

      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-xl font-semibold">
            Connected Device
          </h2>

          <p className="text-muted-foreground mt-2">
            No smartwatch connected
          </p>
        </div>


        <button
          onClick={() => navigate("/connect-device")}
          className="
          rounded-xl
          bg-primary
          px-5
          py-3
          text-primary-foreground
          font-medium
          "
        >
          Connect
        </button>


      </div>

    </div>
  );
}