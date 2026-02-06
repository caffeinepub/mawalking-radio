import type { Show } from '@/data/mockShows';

export function generateICS(show: Show) {
  const now = new Date();
  const startDate = getNextShowDate(show.day, show.time);
  const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours duration

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mawalking Radio//Show Schedule//EN',
    'BEGIN:VEVENT',
    `UID:${show.id}@mawalkingradio.app`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${show.title}`,
    `DESCRIPTION:${show.description}`,
    `LOCATION:Mawalking Radio - https://www.mawalkingradio.app`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${show.title.replace(/\s+/g, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getNextShowDate(day: string, time: string): Date {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = daysOfWeek.indexOf(day);
  const now = new Date();
  const currentDay = now.getDay();
  
  let daysUntilShow = targetDay - currentDay;
  if (daysUntilShow < 0) {
    daysUntilShow += 7;
  }
  
  const showDate = new Date(now);
  showDate.setDate(now.getDate() + daysUntilShow);
  
  const [timeStr, period] = time.split(' ');
  const [hours, minutes] = timeStr.split(':').map(Number);
  let hour24 = hours;
  
  if (period === 'PM' && hours !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  showDate.setHours(hour24, minutes, 0, 0);
  
  return showDate;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
