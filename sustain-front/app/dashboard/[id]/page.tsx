'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { computeSustainScore, stubScoreInputForSite, type SustainScoreResult } from '../../../lib/scoring';

const RegionMap = dynamic(() => import('../../../components/Map'), {
    ssr: false,
    loading: () => <div style={{ width: '100%', height: 400, background: '#ECE9F6', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6680' }}>Loading map...</div>,
});

function slugFromName(name: string): string {
    return name
        .toLowerCase()
        .replace(/\s*\/\s*/g, '-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

function slugToTitle(slug: string): string {
    return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default function DashboardPage({ params }: { params: { id: string } }) {
    const id = params?.id ?? '';
    const [site, setSite] = useState<{ name: string; reason: string; coordinates: [number, number] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState<SustainScoreResult | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            return;
        }
        setFetchError(null);
        fetch('/potential-sites.geojson')
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load data (${res.status})`);
                return res.json();
            })
            .then((data: { features?: Array<{ properties?: { name?: string; reason?: string }; geometry?: { coordinates: [number, number] } }> }) => {
                const feature = data.features?.find(
                    (f) => f.properties?.name && slugFromName(f.properties.name) === id
                );
                if (feature?.properties && feature?.geometry?.coordinates) {
                    const coords = feature.geometry.coordinates;
                    setSite({
                        name: String(feature.properties.name),
                        reason: String(feature.properties.reason || ''),
                        coordinates: [coords[0], coords[1]],
                    });
                    const input = stubScoreInputForSite(feature.properties.name!);
                    setScore(computeSustainScore(input));
                }
                setLoading(false);
            })
            .catch((err) => {
                setFetchError(err instanceof Error ? err.message : 'Failed to load data');
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <main style={styles.main}>
                <p>Loading dashboard...</p>
            </main>
        );
    }

    if (!id) {
        return (
            <main style={styles.main}>
                <h1>Invalid link</h1>
                <p style={{ color: '#6B6680', marginBottom: '1rem' }}>Missing location in URL.</p>
                <Link href="/" style={styles.backLink}>← Back to Map</Link>
            </main>
        );
    }

    if (fetchError) {
        return (
            <main style={styles.main}>
                <h1>Could not load dashboard</h1>
                <p style={{ color: '#6B6680', marginBottom: '1rem' }}>{fetchError}</p>
                <Link href="/" style={styles.backLink}>← Back to Map</Link>
            </main>
        );
    }

    if (!site) {
        return (
            <main style={styles.main}>
                <h1>Site not found</h1>
                <p style={{ color: '#6B6680', marginBottom: '1rem' }}>No location matching &quot;{id}&quot;.</p>
                <Link href="/" style={styles.backLink}>← Back to Map</Link>
            </main>
        );
    }

    const pageTitle = slugToTitle(id);
    const s = score!;

    const barData = [
        { label: 'Grid (Transmission)', score: s.gridScore, weight: '30%' },
        { label: 'Renewable', score: s.renewableScore, weight: '40%' },
        { label: 'Fiber', score: s.fiberScore, weight: '20%' },
        { label: 'Ecosystem', score: s.ecosystemScore, weight: '10%' },
    ];

    return (
        <main style={styles.main}>
            <Link href="/" style={styles.backLink}>← Back to Map</Link>
            <header style={styles.header}>
                <h1 style={styles.title}>{pageTitle}</h1>
                <p style={styles.subtitle}>Sustainability Overview Based on Grid, Renewables, and Connectivity.</p>
            </header>

            <div className="dashboard-two-col" style={styles.twoCol}>
                <div style={styles.leftCol}>
                    <div style={styles.topRow}>
                        <div style={styles.scoreCard}>
                            <div style={styles.scoreCardLabel}>SustAIn Score</div>
                            <div className="animate-pulse-soft" style={styles.scoreCardValue}>{s.overall}</div>
                            <div style={styles.scoreCardMax}>/ 100</div>
                        </div>
                        <div style={styles.barChartCard}>
                            <div style={styles.barChartTitle}>Subscores</div>
                            {barData.map((d) => (
                                <div key={d.label} style={styles.barRow}>
                                    <span style={styles.barLabel}>{d.label}</span>
                                    <div style={styles.barTrack}>
                                        <div className="animate-bar-fill" style={{
                                            ...styles.barFill,
                                            width: `${d.score}%`,
                                            ...(d.label === 'Renewable' ? { background: '#7F9C8C' } : {}),
                                        }} />
                                    </div>
                                    <span style={styles.barValue}>{d.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.metricsGrid}>
                        <MetricCard
                            title="Grid (Transmission)"
                            score={s.gridScore}
                            detail={`${s.transmissionDistanceMiles} mi to nearest line`}
                            description="Proximity to high-voltage transmission. Closer access means lower cost and easier power delivery."
                        />
                        <MetricCard
                            title="Renewable Potential"
                            score={s.renewableScore}
                            detail={typeof s.renewableValue === 'number' ? `Density ${(s.renewableValue as number).toFixed(2)}` : String(s.renewableValue)}
                            description="Local solar, wind, or hydro capacity. Higher scores support greener power procurement."
                        />
                        <MetricCard
                            title="Fiber Connectivity"
                            score={s.fiberScore}
                            detail={`${s.fiberDistanceMiles} mi to corridor`}
                            description="Distance to fiber-optic routes (e.g. along highways). Closer improves latency and redundancy."
                        />
                        <MetricCard
                            title="Data Center Ecosystem"
                            score={s.ecosystemScore}
                            detail={`${s.dataCenterDistanceMiles} mi to nearest site`}
                            description="Proximity to existing data centers. Nearby ecosystem can mean talent, utilities, and supply chain."
                        />
                    </div>
                </div>

                <div style={styles.rightCol}>
                    <div style={styles.mapWrap}>
                        <RegionMap center={site.coordinates} zoom={9} compact />
                    </div>
                </div>
            </div>
        </main>
    );
}

function MetricCard({
    title,
    score,
    detail,
    description,
}: {
    title: string;
    score: number;
    detail: string;
    description: string;
}) {
    return (
        <div className="dashboard-metric-card-hover" style={styles.metricCard}>
            <div style={styles.metricCardHeader}>
                <span style={styles.metricCardTitle}>{title}</span>
                <span style={styles.metricCardScore}>{score}</span>
            </div>
            <p style={styles.metricCardDetail}>{detail}</p>
            <p style={styles.metricCardDescription}>{description}</p>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    main: {
        padding: '1rem 1.25rem',
        maxWidth: 1200,
        margin: '0 auto',
        background: '#F6F4FB',
    },
    backLink: {
        display: 'inline-block',
        marginBottom: '0.5rem',
        color: '#5E4C8A',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
    },
    header: {
        marginBottom: '0.75rem',
    },
    title: {
        fontSize: '1.35rem',
        color: '#7E6BAF',
        marginBottom: '0.15rem',
    },
    subtitle: {
        fontFamily: 'var(--font-bebas), sans-serif',
        fontSize: '0.9rem',
        letterSpacing: '0.04em',
        color: '#6B6680',
        margin: 0,
    },
    twoCol: {
        display: 'grid',
        gridTemplateColumns: '55% 45%',
        gap: 0,
        alignItems: 'stretch',
        height: 720,
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid #E3DEF0',
        boxShadow: '0 2px 12px rgba(94, 76, 138, 0.08)',
    },
    leftCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: 18,
        background: '#FBFAFF',
        minHeight: 0,
    },
    topRow: {
        display: 'grid',
        gridTemplateColumns: '120px 1fr',
        gap: 14,
        alignItems: 'stretch',
    },
    scoreCard: {
        background: 'linear-gradient(145deg, #A38BCB 0%, #7E6BAF 100%)',
        borderRadius: 24,
        padding: '1rem',
        color: '#fff',
        boxShadow: '0 2px 12px rgba(94, 76, 138, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    scoreCardLabel: {
        fontSize: '0.8rem',
        fontWeight: 600,
        opacity: 0.9,
        marginBottom: 4,
        fontFamily: 'var(--font-bebas), sans-serif',
        letterSpacing: '0.1em',
    },
    scoreCardValue: {
        fontSize: '2.5rem',
        fontWeight: 400,
        lineHeight: 1,
        fontFamily: 'var(--font-ribeye), serif',
        color: '#fff',
    },
    scoreCardMax: {
        fontSize: '0.85rem',
        opacity: 0.8,
    },
    barChartCard: {
        background: '#FBFAFF',
        borderRadius: 24,
        padding: '0.85rem 1rem',
        border: '1px solid #E3DEF0',
        boxShadow: '0 1px 4px rgba(94, 76, 138, 0.06)',
    },
    barChartTitle: {
        fontSize: '0.85rem',
        fontWeight: 700,
        color: '#7E6BAF',
        marginBottom: 8,
        fontFamily: 'var(--font-bebas), sans-serif',
        letterSpacing: '0.12em',
    },
    barRow: {
        display: 'grid',
        gridTemplateColumns: '85px 1fr 28px',
        gap: 8,
        alignItems: 'center',
        marginBottom: 6,
    },
    barLabel: {
        fontSize: '0.8rem',
        color: '#6B6680',
    },
    barTrack: {
        height: 10,
        background: '#E3DEF0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        background: '#A38BCB',
        borderRadius: 4,
        minWidth: 2,
    },
    barValue: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#5E4C8A',
        textAlign: 'right',
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
        flex: 1,
        minHeight: 0,
        alignContent: 'stretch',
    },
    metricCard: {
        background: '#FBFAFF',
        borderRadius: 24,
        padding: '0.85rem 1rem',
        border: '1px solid #E3DEF0',
        boxShadow: '0 1px 4px rgba(94, 76, 138, 0.06)',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    metricCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    metricCardTitle: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#7E6BAF',
        fontFamily: 'var(--font-bebas), sans-serif',
        letterSpacing: '0.08em',
    },
    metricCardScore: {
        fontSize: '1.2rem',
        fontWeight: 400,
        color: '#5E4C8A',
        fontFamily: 'var(--font-ribeye), serif',
    },
    metricCardDetail: {
        fontSize: '0.8rem',
        color: '#6B6680',
        margin: '0 0 6px 0',
    },
    metricCardDescription: {
        fontSize: '0.78rem',
        color: '#6B6680',
        lineHeight: 1.4,
        margin: 0,
    },
    rightCol: {
        display: 'flex',
        minHeight: 0,
    },
    mapWrap: {
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
    },
};
