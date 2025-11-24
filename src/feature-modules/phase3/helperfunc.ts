export const toCsv = (arr: any[] | null | undefined) => {
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr
        .map((o: any) => o?.value ?? o?.label ?? o) // accept {value,label} or plain string
        .filter(v => v != null && v !== '')
        .join(',');
};

export const toTitleCase = (str: string) =>
    str
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

export const toNumber = (v: any): number => {
    if (v === null || v === undefined || v === '') return NaN;
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
        const cleaned = v.replace(/[,₹$€]/g, '').trim();
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : NaN;
    }
    return NaN;
};