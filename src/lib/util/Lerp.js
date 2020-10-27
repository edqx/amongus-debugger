export function Clamp(val, min, max) {
    return Math.max(Math.min(val, max), min);
}

export function LerpValue(val, min, max) {
    const clamped = Clamp(val, min, max);

    return min + (max - min) * clamped;
}

export function UnlerpValue(val, min, max) {
    return (val - min) / (max - min);
}