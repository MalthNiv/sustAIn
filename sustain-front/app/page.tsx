import dynamic from 'next/dynamic';
import Link from 'next/link';

const TexasMap = dynamic(() => import('../components/Map'), {
    ssr: false,
    loading: () => (
        <div style={styles.mapLoading}>
            <p style={{ fontFamily: 'var(--font-abhaya)', color: '#6B6680' }}>Loading map…</p>
        </div>
    ),
});

function Sparkle({ style, className }: { style?: React.CSSProperties; className?: string }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.35, ...style }} className={className} aria-hidden>
            <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="#F2E6C9" />
        </svg>
    );
}

export default function Home() {
    return (
        <main style={styles.main}>
            {/* Hero */}
            <section style={styles.hero}>
                <div className="animate-glow-pulse" style={styles.heroGlow} aria-hidden />
                <Sparkle style={{ position: 'absolute', top: '12%', left: '18%' }} className="animate-sparkle" />
                <Sparkle style={{ position: 'absolute', top: '22%', right: '22%', animationDelay: '0.5s' }} className="animate-sparkle" />
                <Sparkle style={{ position: 'absolute', bottom: '28%', left: '24%', animationDelay: '1s' }} className="animate-sparkle" />
                <div style={styles.heroContent}>
                    <h1 style={styles.heroTitle}>sustain</h1>
                    <p style={styles.tagline}>BALANCING GRID AND GREEN</p>
                    <p style={styles.heroBody}>
                        Where renewable potential, infrastructure, and connectivity quietly align.
                    </p>
                    <Link href="#interactive-landscape" className="animate-cta-hover" style={styles.ctaButton}>
                        Explore the Map
                    </Link>
                    <div className="animate-bounce-soft" style={styles.scrollCue} aria-hidden>
                        <span style={styles.scrollCueText}>Scroll</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
                            <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section style={styles.sectionBlock}>
                <h2 style={styles.sectionHeading}>THE MAP TELLS A STORY</h2>
                <p style={styles.sectionBody}>
                    This landscape reveals renewable energy clusters, transmission networks, fiber routes, and the quiet presence of existing data centers. Each point holds a possibility.
                </p>
            </section>

            {/* Map */}
            <section id="interactive-landscape" style={styles.mapSection}>
                <h2 style={styles.sectionHeading}>INTERACTIVE LANDSCAPE</h2>
                <p style={styles.mapSubtitle}>Click a point to open its sustainability overview.</p>
                <div style={styles.mapCard}>
                    <div style={styles.whisperCard}>
                        <p style={styles.whisperTitle}>BEGIN</p>
                        <p style={styles.whisperBody}>Select a location to generate a sustAIn Score.</p>
                    </div>
                    <div style={styles.mapWrap}>
                        <TexasMap compact />
                    </div>
                </div>
            </section>

            {/* After map */}
            <section style={styles.sectionBlock}>
                <h2 style={styles.sectionHeading}>WHAT HAPPENS NEXT</h2>
                <p style={styles.sectionBody}>
                    We measure proximity to transmission and fiber, estimate renewable intensity, and reflect nearby data center presence—balanced into a sustAIn Score.
                </p>
                <div style={styles.sampleScoreCard}>
                    <div style={styles.sampleScoreHeader}>
                        <span style={styles.sampleScoreLabel}>SustAIn Score</span>
                        <span className="animate-pulse-soft" style={styles.sampleScoreValue}>82</span>
                    </div>
                    <div style={styles.sampleScoreRows}>
                        <div style={styles.sampleScoreRow}><span>Grid</span><span style={styles.sampleScoreNum}>80</span></div>
                        <div style={styles.sampleScoreRow}><span>Renewables</span><span style={styles.sampleScoreNum}>88</span></div>
                        <div style={styles.sampleScoreRow}><span>Fiber</span><span style={styles.sampleScoreNum}>72</span></div>
                        <div style={styles.sampleScoreRow}><span>Ecosystem</span><span style={styles.sampleScoreNum}>78</span></div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <p style={styles.footerText}>sustAIn — designed to sustain.</p>
            </footer>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    main: {
        minHeight: '100vh',
        background: '#F6F4FB',
    },
    hero: {
        position: 'relative',
        padding: '4rem 1.5rem 5rem',
        textAlign: 'center',
        overflow: 'hidden',
    },
    heroGlow: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(80vw, 520px)',
        height: '280px',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(163, 139, 203, 0.2) 0%, transparent 70%)',
        filter: 'blur(40px)',
        pointerEvents: 'none',
    },
    heroContent: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: 560,
        margin: '0 auto',
    },
    heroTitle: {
        fontFamily: 'var(--font-ribeye), serif',
        fontSize: 'clamp(2.5rem, 8vw, 3.75rem)',
        fontWeight: 400,
        letterSpacing: '0.02em',
        background: 'linear-gradient(135deg, #5E4C8A 0%, #7E6BAF 50%, #A38BCB 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        margin: 0,
        lineHeight: 1.1,
    },
    tagline: {
        fontFamily: 'var(--font-bebas), sans-serif',
        fontSize: '1.25rem',
        letterSpacing: '0.08em',
        color: '#7E6BAF',
        margin: 0,
    },
    heroBody: {
        fontFamily: 'var(--font-abhaya), serif',
        fontSize: '1.05rem',
        color: '#6B6680',
        lineHeight: 1.6,
        margin: 0,
    },
    ctaButton: {
        display: 'inline-block',
        marginTop: '0.5rem',
        padding: '0.75rem 1.75rem',
        background: 'linear-gradient(145deg, #A38BCB 0%, #7E6BAF 100%)',
        color: '#fff',
        fontFamily: 'var(--font-abhaya), serif',
        fontSize: '1rem',
        fontWeight: 600,
        textDecoration: 'none',
        borderRadius: 24,
        boxShadow: '0 2px 12px rgba(94, 76, 138, 0.2)',
        border: '1px solid rgba(255,255,255,0.2)',
    },
    scrollCue: {
        marginTop: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.25rem',
        color: '#7E6BAF',
    },
    scrollCueText: {
        fontFamily: 'var(--font-bebas), sans-serif',
        fontSize: '0.85rem',
        letterSpacing: '0.15em',
    },
    sectionBlock: {
        padding: '4rem 1.5rem',
        background: '#ECE9F6',
        margin: '0',
    },
    sectionHeading: {
        fontFamily: 'var(--font-bebas), sans-serif',
        fontSize: '1.35rem',
        letterSpacing: '0.18em',
        color: '#7E6BAF',
        textAlign: 'center',
        marginBottom: '1.25rem',
        maxWidth: 640,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    sectionBody: {
        fontFamily: 'var(--font-abhaya), serif',
        fontSize: '1.05rem',
        color: '#6B6680',
        lineHeight: 1.7,
        maxWidth: 560,
        margin: '0 auto',
        textAlign: 'center',
    },
    mapSection: {
        padding: '4rem 1.5rem',
        background: '#F6F4FB',
    },
    mapSubtitle: {
        fontFamily: 'var(--font-bebas), sans-serif',
        fontSize: '1rem',
        letterSpacing: '0.04em',
        color: '#6B6680',
        textAlign: 'center',
        marginBottom: '1.5rem',
        maxWidth: 480,
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    mapCard: {
        position: 'relative',
        maxWidth: 1100,
        margin: '0 auto',
        background: '#FBFAFF',
        border: '1px solid #E3DEF0',
        borderRadius: 24,
        boxShadow: '0 2px 12px rgba(94, 76, 138, 0.08)',
        overflow: 'hidden',
        minHeight: 560,
    },
    whisperCard: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        zIndex: 10,
        padding: '0.75rem 1rem',
        background: 'rgba(251, 250, 255, 0.95)',
        border: '1px solid #E3DEF0',
        borderRadius: 16,
        boxShadow: '0 2px 8px rgba(94, 76, 138, 0.06)',
        maxWidth: 220,
    },
    whisperTitle: {
        fontFamily: 'var(--font-bebas), sans-serif',
        fontSize: '0.9rem',
        letterSpacing: '0.15em',
        color: '#7E6BAF',
        margin: '0 0 0.25rem 0',
    },
    whisperBody: {
        fontFamily: 'var(--font-abhaya), serif',
        fontSize: '0.8rem',
        color: '#6B6680',
        lineHeight: 1.4,
        margin: 0,
    },
    mapWrap: {
        width: '100%',
        height: 560,
        minHeight: 560,
        position: 'relative',
    },
    mapLoading: {
        width: '100%',
        height: 560,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ECE9F6',
    },
    sampleScoreCard: {
        maxWidth: 320,
        margin: '2rem auto 0',
        padding: '1.25rem 1.5rem',
        background: '#FBFAFF',
        border: '1px solid #E3DEF0',
        borderRadius: 24,
        boxShadow: '0 2px 12px rgba(94, 76, 138, 0.08)',
    },
    sampleScoreHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid #E3DEF0',
    },
    sampleScoreLabel: {
        fontFamily: 'var(--font-bebas), sans-serif',
        fontSize: '0.9rem',
        letterSpacing: '0.1em',
        color: '#7E6BAF',
    },
    sampleScoreValue: {
        fontFamily: 'var(--font-ribeye), serif',
        fontSize: '2rem',
        fontWeight: 400,
        color: '#5E4C8A',
    },
    sampleScoreRows: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    sampleScoreRow: {
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-abhaya), serif',
        fontSize: '0.9rem',
        color: '#6B6680',
    },
    sampleScoreNum: {
        fontFamily: 'var(--font-ribeye), serif',
        color: '#5E4C8A',
    },
    footer: {
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: '#F6F4FB',
    },
    footerText: {
        fontFamily: 'var(--font-abhaya), serif',
        fontSize: '0.9rem',
        color: '#6B6680',
        margin: 0,
    },
};
