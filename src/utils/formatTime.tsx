export default function formatSecondsToHHMMSS(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }  

  export const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const formattedHours = hours > 0 ? `${hours}h ` : '';
    const formattedMinutes = minutes > 0 ? `${minutes}min` : '';
    return formattedHours + formattedMinutes || '0 min';
  };