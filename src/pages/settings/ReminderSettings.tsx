import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Clock, Moon, Sun } from "lucide-react";
import TimeWheelPicker from "@/components/settings/TimeWheelPicker";
type ReminderPreferences = {
  dailyReminders: boolean;
  reminderTime: string;
  moodTracking: boolean;
  weeklyReports: boolean;
  sleepReminders: boolean;
};

const STORAGE_KEY = "saathi_reminder_preferences_v1";

const DEFAULT_PREFERENCES: ReminderPreferences = {
  dailyReminders: true,
  reminderTime: "20:00",
  moodTracking: true,
  weeklyReports: false,
  sleepReminders: true,
};

const TIME_PRESETS = [
  { label: "Morning", time: "08:00", icon: Sun },
  { label: "Afternoon", time: "13:00", icon: Sun },
  { label: "Evening", time: "20:00", icon: Moon },
  { label: "Night", time: "22:00", icon: Moon },
];

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5);

const formatTime = (time: string) => {
  const [rawHour, rawMinute] = time.split(":").map(Number);
  const hour = rawHour % 12 || 12;
  const period: "AM" | "PM" = rawHour >= 12 ? "PM" : "AM";

  return {
    hour,
    minute: rawMinute,
    period,
  };
};

const to24Hour = (
  hour: number,
  minute: number,
  period: "AM" | "PM",
) => {
  let hour24 = hour;

  if (period === "AM") {
    hour24 = hour === 12 ? 0 : hour;
  } else {
    hour24 = hour === 12 ? 12 : hour + 12;
  }

  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0",
  )}`;
};

type WheelColumnProps = {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  disabled?: boolean;
  format?: (value: number) => string;
  label: string;
};

function WheelColumn({
  values,
  selected,
  onSelect,
  disabled = false,
  format = String,
  label,
}: WheelColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const itemHeight = 48;
  const paddingItems = 2;

  const selectedIndex = Math.max(values.indexOf(selected), 0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.scrollTo({
      top: selectedIndex * itemHeight,
      behavior: "smooth",
    });
  }, [selectedIndex]);

  const handleScroll = () => {
    if (disabled || !ref.current) return;

    const index = Math.round(ref.current.scrollTop / itemHeight);
    const value = values[index];

    if (value !== undefined && value !== selected) {
      onSelect(value);
    }
  };

  return (
    <div className="relative w-20 sm:w-24">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-12 -translate-y-1/2 rounded-xl border border-primary/20 bg-primary/10" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-card via-card/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-card via-card/80 to-transparent" />

      <div
        ref={ref}
        onScroll={handleScroll}
        role="listbox"
        aria-label={label}
        aria-disabled={disabled}
        className="relative h-36 snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollPaddingTop: itemHeight * paddingItems,
          scrollPaddingBottom: itemHeight * paddingItems,
        }}
      >
        {Array.from({ length: paddingItems }).map((_, index) => (
          <div key={`top-${index}`} className="h-12 shrink-0" />
        ))}

        {values.map((value) => {
          const isSelected = value === selected;

          return (
            <button
              key={value}
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={disabled}
              onClick={() => onSelect(value)}
              className={`flex h-12 w-full snap-center items-center justify-center text-center transition-all duration-200 ${isSelected
                ? "relative z-20 scale-110 text-lg font-semibold text-foreground"
                : "text-sm font-medium text-muted-foreground/60 hover:text-muted-foreground"
                }`}
            >
              {format(value)}
            </button>
          );
        })}

        {Array.from({ length: paddingItems }).map((_, index) => (
          <div key={`bottom-${index}`} className="h-12 shrink-0" />
        ))}
      </div>
    </div>
  );
}

type AndroidTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

function AndroidTimePicker({
  value,
  onChange,
  disabled = false,
}: AndroidTimePickerProps) {
  const initial = formatTime(value);

  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(
    Math.round(initial.minute / 5) * 5 === 60
      ? 55
      : Math.round(initial.minute / 5) * 5,
  );
  const [period, setPeriod] = useState<"AM" | "PM">(initial.period);

  useEffect(() => {
    const next = formatTime(value);

    setHour(next.hour);
    setMinute(
      Math.round(next.minute / 5) * 5 === 60
        ? 55
        : Math.round(next.minute / 5) * 5,
    );
    setPeriod(next.period);
  }, [value]);

  const commit = (
    nextHour: number,
    nextMinute: number,
    nextPeriod: "AM" | "PM",
  ) => {
    onChange(to24Hour(nextHour, nextMinute, nextPeriod));
  };

  const selectHour = (nextHour: number) => {
    setHour(nextHour);
    commit(nextHour, minute, period);
  };

  const selectMinute = (nextMinute: number) => {
    setMinute(nextMinute);
    commit(hour, nextMinute, period);
  };

  const selectPeriod = (nextPeriod: "AM" | "PM") => {
    setPeriod(nextPeriod);
    commit(hour, minute, nextPeriod);
  };

  return (
    <div
      className={`rounded-3xl border border-border/50 bg-card p-5 shadow-sm transition-opacity ${disabled ? "opacity-50" : ""
        }`}
    >
      <div className="mb-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-4 w-4 text-primary" />
        <span>Scroll to set your reminder</span>
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-3">
        <WheelColumn
          values={HOURS}
          selected={hour}
          onSelect={selectHour}
          disabled={disabled}
          format={(number) => String(number)}
          label="Hour"
        />

        <span className="pb-1 text-2xl font-light text-muted-foreground">
          :
        </span>

        <WheelColumn
          values={MINUTES}
          selected={minute}
          onSelect={selectMinute}
          disabled={disabled}
          format={(number) => String(number).padStart(2, "0")}
          label="Minute"
        />

        <div className="ml-2 flex flex-col gap-1 rounded-xl border border-border/50 bg-muted/30 p-1">
          {(["AM", "PM"] as const).map((option) => (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => selectPeriod(option)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${period === option
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-medium">
          {period === "AM" ? "A calm start" : "A gentle check-in"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {String(hour).padStart(2, "0")}:
          {String(minute).padStart(2, "0")} {period}
        </p>
      </div>
    </div>
  );
}

const ReminderSettings = () => {
  const [preferences, setPreferences] =
    useState<ReminderPreferences>(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return DEFAULT_PREFERENCES;

        return {
          ...DEFAULT_PREFERENCES,
          ...JSON.parse(saved),
        };
      } catch {
        return DEFAULT_PREFERENCES;
      }
    });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreference = <K extends keyof ReminderPreferences>(
    key: K,
    value: ReminderPreferences[K],
  ) => {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  };

  const selectedTime = useMemo(
    () => formatTime(preferences.reminderTime),
    [preferences.reminderTime],
  );

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 pb-32 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Reminders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create gentle moments that help you stay connected with yourself.
          </p>
        </div>

        <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Bell className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Daily reminders
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Let Saathi gently remind you to check in.
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={preferences.dailyReminders}
              onClick={() =>
                updatePreference(
                  "dailyReminders",
                  !preferences.dailyReminders,
                )
              }
              className={`relative h-7 w-12 shrink-0 overflow-hidden rounded-full transition-colors ${preferences.dailyReminders
                ? "bg-primary"
                : "bg-muted"
                }`}
            >
              <span
                className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${preferences.dailyReminders
                  ? "translate-x-5"
                  : "translate-x-0"
                  }`}
              />
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                Reminder time
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Pick the moment that feels right for you.
              </p>
            </div>
          </div>

          <TimeWheelPicker
            value={preferences.reminderTime}
            onChange={(value) =>
              updatePreference("reminderTime", value)
            }
            disabled={!preferences.dailyReminders}
          />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TIME_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected =
                preferences.reminderTime === preset.time;

              const formatted = formatTime(preset.time);

              return (
                <button
                  key={preset.time}
                  type="button"
                  disabled={!preferences.dailyReminders}
                  onClick={() =>
                    updatePreference(
                      "reminderTime",
                      preset.time,
                    )
                  }
                  className={`rounded-xl border p-3 text-left transition-all ${isSelected
                    ? "border-primary/40 bg-primary/10"
                    : "border-border/50 bg-background hover:border-primary/30 hover:bg-muted/40"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      className={`h-4 w-4 ${isSelected
                        ? "text-primary"
                        : "text-muted-foreground"
                        }`}
                    />

                    {isSelected && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>

                  <div className="mt-2 text-xs font-medium">
                    {preset.label}
                  </div>

                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {formatted.hour}:
                    {String(formatted.minute).padStart(2, "0")}{" "}
                    {formatted.period}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-xl bg-muted/30 px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Current reminder
            </p>
            <p className="mt-1 text-sm font-semibold">
              {selectedTime.hour}:
              {String(selectedTime.minute).padStart(2, "0")}{" "}
              {selectedTime.period}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="space-y-4">
            {[
              {
                key: "moodTracking" as const,
                title: "Mood tracking",
                description: "Receive a gentle daily mood check-in.",
              },
              {
                key: "weeklyReports" as const,
                title: "Weekly reports",
                description: "Get a weekly summary of your wellness journey.",
              },
              {
                key: "sleepReminders" as const,
                title: "Sleep reminders",
                description: "Wind down with a reminder for your night routine.",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={preferences[item.key]}
                  onClick={() =>
                    updatePreference(
                      item.key,
                      !preferences[item.key],
                    )
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors duration-200 ${preferences[item.key]
                      ? "bg-primary"
                      : "bg-muted"
                    }`}
                >
                  <span
                    className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${preferences[item.key]
                        ? "translate-x-5"
                        : "translate-x-0"
                      }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.99]"
        >
          {saved && <Check className="h-4 w-4" />}
          {saved ? "Saved" : "Save reminder settings"}
        </button>
      </div>
    </div>
  );
};

export default ReminderSettings;