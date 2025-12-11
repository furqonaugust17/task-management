/**
 * Validation Utility Functions (Converted to JS)
 */

// Cek apakah value kosong
export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

// Cek format tanggal YYYY-MM-DD atau ISO string
export function isValidDate(date) {
    if (!date) return false;
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
}

// Cek apakah field yang wajib diisi ada
export function hasRequiredFields(obj, requiredFields) {
    return requiredFields.every((field) => {
        const value = obj[field];
        return value !== null && value !== undefined && value !== '';
    });
}

// Cek apakah nilai termasuk dalam Enum yang diizinkan
export function isValueInEnum(value, enumObject) {
    return Object.values(enumObject).includes(value);
}

// Helper validator sederhana
export function createValidator(rules) {
    return (data) => {
        const errors = {};
        for (const key in rules) {
            const rule = rules[key];
            const result = rule(data[key]);
            if (result !== true) {
                errors[key] = typeof result === 'string' ? result : 'Validasi gagal';
            }
        }
        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    };
}