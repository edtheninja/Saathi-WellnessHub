interface Props {
  connected: boolean;
}

export default function PhysicalHealthSection({
  connected,
}: Props) {

  return (
    <div className="rounded-3xl border bg-card p-6">

      <h2 className="text-xl font-semibold">
        Physical Wellness
      </h2>

      {connected ? (

        <div className="mt-5">

          Smartwatch Connected

        </div>

      ) : (

        <div className="mt-5 text-muted-foreground">

          Connect a smartwatch to
          view heart rate,
          sleep,
          steps,
          calories,
          oxygen,
          and distance.

        </div>

      )}

    </div>
  );
}