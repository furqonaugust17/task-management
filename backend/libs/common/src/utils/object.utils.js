/**
 * Object Utility Functions (Converted to JS)
 */

// Mengambil hanya key tertentu (misal: membuang password/field sensitif)
export function pick(obj, keys) {
    const result = {};
    keys.forEach((key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

// Membuang key tertentu
export function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach((key) => {
        delete result[key];
    });
    return result;
}