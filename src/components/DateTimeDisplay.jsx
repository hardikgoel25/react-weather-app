export default function DateTimeDisplay({ timezone }) {
    const now = new Date();

    const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        timeZone: timezone
    });

    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: timezone
    });

    return (
        <p className="text-sm text-white/80">{`${dateStr}, ${timeStr}`}</p>
    );
}
