export function timestampNow(ntpoffset_){
	return (Date.now()) + ntpoffset_;
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