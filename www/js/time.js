let offset = 0;

export async function syncNTP(){
  const res = await fetch("https://rptes.com/ntp");
  const data = await res.json();
  if (!data?.unixtime) throw new Error('Invalid NTP response');

  const serverTime = data.unixtime * 1000;
  offset = serverTime - Date.now();

  console.log('[NTP] offset =', offset);
}

export function timestampNow(a){
	return (Date.now()) + offset;
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  const YYYY = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0'); // 月份從0開始
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${YYYY}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}