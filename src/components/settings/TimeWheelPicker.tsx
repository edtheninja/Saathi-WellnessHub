import { useEffect, useMemo, useRef } from "react";

type TimeWheelPickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

type WheelProps = {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel: string;
};

const ITEM_HEIGHT = 44;

function Wheel({
  items,
  value,
  onChange,
  disabled = false,
  ariaLabel,
}: WheelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIndex = Math.max(items.indexOf(value), 0);

  const paddedItems = useMemo(
    () => [null, null, ...items, null, null],
    [items]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: selectedIndex * ITEM_HEIGHT,
      behavior: "smooth",
    });
  }, [selectedIndex]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const index = Math.round(container.scrollTop / ITEM_HEIGHT);
    const nextValue = items[index];

    if (nextValue && nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <div
      className={`relative w-24 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {/* Selection highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-11 -translate-y-1/2 rounded-xl border border-primary/20 bg-primary/10"
        aria-hidden="true"
      />

      {/* Top fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-card to-transparent"
        aria-hidden="true"
      />

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-card to-transparent"
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        aria-label={ariaLabel}
        className="relative h-[132px] snap-y snap-mandatory overflow-y-auto overscroll-contain px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollPaddingTop: ITEM_HEIGHT,
          scrollPaddingBottom: ITEM_HEIGHT,
        }}
      >
        {paddedItems.map((item, index) => (
          <div
            key={`${item ?? "empty"}-${index}`}
            className="flex h-11 snap-center items-center justify-center"
          >
            {item && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(item)}
                className={`relative z-30 w-full text-center text-sm font-medium transition-all ${
                  item === value
                    ? "scale-105 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const TimeWheelPicker = ({
  value,
  onChange,
  disabled = false,
}: TimeWheelPickerProps) => {
  const [hour, minute] = value.split(":").map(Number);

  const isPM = hour >= 12;

  const displayHour = hour % 12 || 12;

  const hours = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );

  const minutes = Array.from({ length: 12 }, (_, index) =>
    String(index * 5).padStart(2, "0")
  );

  const periods = ["AM", "PM"];

  const updateTime = (
    nextHour: number,
    nextMinute: number,
    nextPeriod: "AM" | "PM"
  ) => {
    let hour24 = nextHour;

    if (nextPeriod === "AM") {
      hour24 = nextHour === 12 ? 0 : nextHour;
    } else {
      hour24 = nextHour === 12 ? 12 : nextHour + 12;
    }

    onChange(
      `${String(hour24).padStart(2, "0")}:${String(
        nextMinute
      ).padStart(2, "0")}`
    );
  };

  const currentMinute = String(
    Math.round(minute / 5) * 5
  ).padStart(2, "0");

  return (
    <div
      className={`rounded-2xl border border-border/50 bg-muted/20 px-4 py-5 transition-opacity ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Wheel
          items={hours}
          value={String(displayHour).padStart(2, "0")}
          disabled={disabled}
          ariaLabel="Select hour"
          onChange={(nextHour) =>
            updateTime(
              Number(nextHour),
              minute,
              isPM ? "PM" : "AM"
            )
          }
        />

        <span className="text-2xl font-light text-muted-foreground">
          :
        </span>

        <Wheel
          items={minutes}
          value={currentMinute}
          disabled={disabled}
          ariaLabel="Select minute"
          onChange={(nextMinute) =>
            updateTime(
              displayHour,
              Number(nextMinute),
              isPM ? "PM" : "AM"
            )
          }
        />

        <Wheel
          items={periods}
          value={isPM ? "PM" : "AM"}
          disabled={disabled}
          ariaLabel="Select AM or PM"
          onChange={(nextPeriod) =>
            updateTime(
              displayHour,
              minute,
              nextPeriod as "AM" | "PM"
            )
          }
        />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Scroll or swipe to choose your time
      </p>
    </div>
  );
};

export default TimeWheelPicker;