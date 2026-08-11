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
const VISIBLE_ITEMS = 3;
const SIDE_PADDING = 1;

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
    () => [
      ...Array(SIDE_PADDING).fill(null),
      ...items,
      ...Array(SIDE_PADDING).fill(null),
    ],
    [items]
  );

  /*
   * Keep the selected value aligned with the center
   * of the visible wheel.
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targetScroll =
      selectedIndex * ITEM_HEIGHT;

    if (Math.abs(container.scrollTop - targetScroll) > 1) {
      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const handleScroll = () => {
    const container = containerRef.current;

    if (!container || disabled) return;

    /*
     * The first real item begins after SIDE_PADDING.
     * Remove that padding from the calculated index.
     */
    const rawIndex = Math.round(
      container.scrollTop / ITEM_HEIGHT
    );

    const itemIndex = rawIndex;

    const nextValue = items[itemIndex];

    if (
      nextValue !== undefined &&
      nextValue !== value
    ) {
      onChange(nextValue);
    }
  };

  const handleWheelClick = (item: string) => {
    if (disabled) return;

    onChange(item);
  };

  return (
    <div
      className={`relative w-24 ${
        disabled ? "opacity-40" : ""
      }`}
    >
      {/* Center selection area */}
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
        role="listbox"
        aria-label={ariaLabel}
        aria-disabled={disabled}
        className="relative h-[132px] snap-y snap-mandatory overflow-y-auto overscroll-contain px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollPaddingTop: ITEM_HEIGHT,
          scrollPaddingBottom: ITEM_HEIGHT,
        }}
      >
        {paddedItems.map((item, index) => {
          const isSelected = item === value;

          return (
            <div
              key={`${item ?? "empty"}-${index}`}
              className="flex h-11 snap-center items-center justify-center"
            >
              {item && (
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={disabled}
                  onClick={() =>
                    handleWheelClick(item)
                  }
                  className={`relative z-30 w-full text-center transition-all duration-200 ${
                    isSelected
                      ? "scale-110 text-lg font-semibold text-foreground"
                      : "text-sm font-medium text-muted-foreground/55 hover:text-muted-foreground"
                  }`}
                >
                  {item}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TimeWheelPicker = ({
  value,
  onChange,
  disabled = false,
}: TimeWheelPickerProps) => {
  const [rawHour, rawMinute] = value
    .split(":")
    .map(Number);

  const safeHour = Number.isFinite(rawHour)
    ? rawHour
    : 20;

  const safeMinute = Number.isFinite(rawMinute)
    ? rawMinute
    : 0;

  const isPM = safeHour >= 12;

  const displayHour =
    safeHour % 12 || 12;

  /*
   * Keep minutes on 5-minute intervals.
   * Prevent 60 from ever appearing.
   */
  const roundedMinute =
    Math.round(safeMinute / 5) * 5;

  const normalizedMinute =
    roundedMinute >= 60
      ? 55
      : roundedMinute;

  const hours = Array.from(
    { length: 12 },
    (_, index) =>
      String(index + 1).padStart(2, "0")
  );

  const minutes = Array.from(
    { length: 12 },
    (_, index) =>
      String(index * 5).padStart(2, "0")
  );

  const periods = ["AM", "PM"];

  const currentMinute = String(
    normalizedMinute
  ).padStart(2, "0");

  const updateTime = (
    nextHour: number,
    nextMinute: number,
    nextPeriod: "AM" | "PM"
  ) => {
    let hour24 = nextHour;

    if (nextPeriod === "AM") {
      hour24 =
        nextHour === 12 ? 0 : nextHour;
    } else {
      hour24 =
        nextHour === 12
          ? 12
          : nextHour + 12;
    }

    const safeMinute =
      Math.min(
        Math.max(nextMinute, 0),
        55
      );

    onChange(
      `${String(hour24).padStart(
        2,
        "0"
      )}:${String(safeMinute).padStart(
        2,
        "0"
      )}`
    );
  };

  return (
    <div
      className={`rounded-3xl border border-border/50 bg-card px-4 py-5 shadow-sm transition-opacity ${
        disabled ? "opacity-50" : ""
      }`}
    >
      {/* Header */}
      <div className="mb-4 text-center">
        <p className="text-sm font-medium">
          Set reminder time
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Scroll or swipe to choose
        </p>
      </div>

      {/* Wheels */}
      <div className="flex items-center justify-center gap-1 sm:gap-3">
        <Wheel
          items={hours}
          value={String(displayHour).padStart(
            2,
            "0"
          )}
          disabled={disabled}
          ariaLabel="Select hour"
          onChange={(nextHour) =>
            updateTime(
              Number(nextHour),
              normalizedMinute,
              isPM ? "PM" : "AM"
            )
          }
        />

        <span className="pb-1 text-2xl font-light text-muted-foreground">
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

        {/* AM / PM */}
        <div className="ml-2 flex flex-col gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
          {periods.map((period) => {
            const selected =
              (isPM ? "PM" : "AM") === period;

            return (
              <button
                key={period}
                type="button"
                disabled={disabled}
                onClick={() =>
                  updateTime(
                    displayHour,
                    normalizedMinute,
                    period as "AM" | "PM"
                  )
                }
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              >
                {period}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected time */}
      <div className="mt-5 text-center">
        <p className="text-lg font-semibold tracking-wide">
          {String(displayHour).padStart(
            2,
            "0"
          )}
          :
          {currentMinute}{" "}
          {isPM ? "PM" : "AM"}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {isPM
            ? "A gentle evening check-in"
            : "A calm start to your day"}
        </p>
      </div>
    </div>
  );
};

export default TimeWheelPicker;