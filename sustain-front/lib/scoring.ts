/**
 * sustAIn scoring: subscores from distances + renewable value, then weighted overall.
 * Stub distances for now; wire to real data later.
 */

export type RenewableCategory = 'low' | 'medium' | 'high';

function transmissionMilesToScore(miles: number): number {
    if (miles <= 5) return 100;
    if (miles <= 15) return 80;
    if (miles <= 30) return 60;
    if (miles <= 60) return 40;
    return 20;
}

function fiberMilesToScore(miles: number): number {
    if (miles <= 5) return 100;
    if (miles <= 15) return 80;
    if (miles <= 30) return 60;
    if (miles <= 60) return 40;
    return 20;
}

function dataCenterMilesToScore(miles: number): number {
    if (miles <= 25) return 90;
    if (miles <= 75) return 70;
    if (miles <= 150) return 50;
    return 30;
}

function renewableToScore(value: number | RenewableCategory): number {
    if (typeof value === 'number') return Math.round(Math.max(0, Math.min(1, value)) * 100);
    switch (value) {
        case 'low': return 30;
        case 'medium': return 65;
        case 'high': return 90;
        default: return 50;
    }
}

const WEIGHTS = {
    transmission: 0.30,
    renewable: 0.40,
    fiber: 0.20,
    ecosystem: 0.10,
} as const;

export interface SustainScoreInput {
    transmissionDistanceMiles: number;
    fiberDistanceMiles: number;
    dataCenterDistanceMiles: number;
    renewableValue: number | RenewableCategory;
}

export interface SustainScoreResult {
    overall: number;
    gridScore: number;
    renewableScore: number;
    fiberScore: number;
    ecosystemScore: number;
    transmissionDistanceMiles: number;
    fiberDistanceMiles: number;
    dataCenterDistanceMiles: number;
    renewableValue: number | RenewableCategory;
}

/**
 * Compute sustAIn score and subscores. Pass stub distances for now.
 */
export function computeSustainScore(input: SustainScoreInput): SustainScoreResult {
    const gridScore = transmissionMilesToScore(input.transmissionDistanceMiles);
    const fiberScore = fiberMilesToScore(input.fiberDistanceMiles);
    const ecosystemScore = dataCenterMilesToScore(input.dataCenterDistanceMiles);
    const renewableScore = renewableToScore(input.renewableValue);

    const overall = Math.round(
        gridScore * WEIGHTS.transmission +
        renewableScore * WEIGHTS.renewable +
        fiberScore * WEIGHTS.fiber +
        ecosystemScore * WEIGHTS.ecosystem
    );

    return {
        overall: Math.min(100, Math.max(0, overall)),
        gridScore,
        renewableScore,
        fiberScore,
        ecosystemScore,
        transmissionDistanceMiles: input.transmissionDistanceMiles,
        fiberDistanceMiles: input.fiberDistanceMiles,
        dataCenterDistanceMiles: input.dataCenterDistanceMiles,
        renewableValue: input.renewableValue,
    };
}

/**
 * Stub inputs per site (deterministic from site name) for UI. Replace with real API later.
 */
export function stubScoreInputForSite(siteName: string): SustainScoreInput {
    const hash = siteName.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
    const seed = Math.abs(hash);
    // Vary distances and renewable within plausible ranges
    return {
        transmissionDistanceMiles: [2, 8, 12, 25, 45][seed % 5],
        fiberDistanceMiles: [1, 6, 18, 35][seed % 4],
        dataCenterDistanceMiles: [15, 40, 80, 120, 180][seed % 5],
        renewableValue: seed % 3 === 0 ? 0.72 : seed % 3 === 1 ? 'medium' : 'high',
    };
}
