export function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}