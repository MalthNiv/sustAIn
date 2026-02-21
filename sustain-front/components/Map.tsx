'use client'; // Required for Next.js App Router

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const mapboxToken = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '' : '';

interface TexasMapProps {
    center?: [number, number];
    zoom?: number;
    compact?: boolean;
}

const TexasMap: React.FC<TexasMapProps> = ({ center = [-98, 39], zoom = 3.8, compact = false }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;
        if (!mapboxToken) return;

        const container = mapContainerRef.current;
        const init = () => {
            if (mapRef.current || !container) return;
            try {
                mapboxgl.accessToken = mapboxToken;
                const map = new mapboxgl.Map({
                    container,
                    style: 'mapbox://styles/mapbox/dark-v11',
                    center,
                    zoom,
                });
                mapRef.current = map;

            // CRITICAL: Everything data-related goes inside this 'load' event
            map.on('load', () => {
                map.resize();
                const layers = map.getStyle().layers;
                let firstLabelId;
                for (const layer of layers) {
                    if (layer.type === 'symbol') {
                        firstLabelId = layer.id;
                        break;
                    }
                }

                // Fiber corridors — softer glow and line
                map.addLayer({
                    id: 'fiber-proxy-corridors-glow',
                    type: 'line',
                    source: 'composite',
                    'source-layer': 'road',
                    filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
                    paint: {
                        'line-color': '#c084fc',
                        'line-width': [
                            'interpolate', ['linear'], ['zoom'],
                            5, 2,
                            12, 8
                        ],
                        'line-opacity': [
                            'interpolate', ['linear'], ['zoom'],
                            5, 0.05,
                            10, 0.1
                        ],
                        'line-blur': [
                            'interpolate', ['linear'], ['zoom'],
                            5, 3,
                            12, 6
                        ]
                    }
                }, firstLabelId);

                map.addLayer({
                    id: 'fiber-proxy-corridors',
                    type: 'line',
                    source: 'composite',
                    'source-layer': 'road',
                    filter: ['match', ['get', 'class'], ['motorway', 'trunk'], true, false],
                    paint: {
                        'line-color': '#a78bfa',
                        'line-width': [
                            'interpolate', ['linear'], ['zoom'],
                            6, 1,
                            15, 3.5
                        ],
                        'line-opacity': [
                            'interpolate', ['linear'], ['zoom'],
                            5, 0.2,
                            10, 0.5
                        ],
                        'line-blur': 0.8
                    }
                }, firstLabelId);

                console.log("Map style loaded. Adding transmission lines...");

                map.addSource('transmission-lines', {
                    type: 'geojson',
                    data: '/transmission-lines.json'
                });

                map.addLayer({
                    id: 'lines-layer',
                    type: 'line',
                    source: 'transmission-lines',
                    paint: {
                        'line-color': '#94a3b8',
                        'line-width': 0.4,
                        'line-opacity': 0.2
                    }
                });

                map.addSource('renewable-plants', {
                    type: 'geojson',
                    data: '/power-plants.geojson'
                });

                map.addLayer({
                    id: 'renewable-plants-layer',
                    type: 'circle',
                    source: 'renewable-plants',
                    minzoom: 6,
                    filter: [
                        'any',
                        ['>', ['get', 'hydro_mw'], 0],
                        ['>', ['get', 'hydrops_mw'], 0],
                        ['>', ['get', 'solar_mw'], 0],
                        ['>', ['get', 'wind_mw'], 0],
                        ['>', ['get', 'geo_mw'], 0],
                        ['>', ['get', 'bio_mw'], 0],
                        ['>', ['get', 'nuclear_mw'], 0]
                    ],
                    paint: {
                        'circle-color': [
                            'case',
                            ['>', ['get', 'solar_mw'], 0], '#fcd34d',
                            ['>', ['get', 'wind_mw'], 0], '#f9a8d4',
                            ['>', ['get', 'hydro_mw'], 0], '#67e8f9',
                            '#94a3b8'
                        ],
                        'circle-radius': [
                            'interpolate', ['linear'], ['zoom'],
                            6, 5,
                            10, 12,
                            14, 18,
                            18, 28
                        ],
                        'circle-opacity': 0.82
                    }
                });

                map.addLayer({
                    id: 'renewable-heat',
                    type: 'heatmap',
                    source: 'renewable-plants',
                    maxzoom: 9,
                    paint: {
                        'heatmap-weight': [
                            'interpolate', ['linear'],
                            ['+', ['get', 'solar_mw'], ['get', 'wind_mw']],
                            0, 0,
                            500, 1
                        ],
                        'heatmap-intensity': [
                            'interpolate', ['linear'], ['zoom'],
                            0, 1.2,
                            6, 2.5
                        ],
                        'heatmap-color': [
                            'interpolate', ['linear'], ['heatmap-density'],
                            0, 'rgba(0, 0, 0, 0)',
                            0.2, 'rgba(103, 232, 249, 0.35)',
                            0.45, 'rgba(103, 232, 249, 0.6)',
                            0.7, 'rgba(167, 139, 250, 0.8)',
                            1, 'rgba(196, 181, 253, 0.95)'
                        ],
                        'heatmap-radius': [
                            'interpolate', ['linear'], ['zoom'],
                            0, 5,
                            5, 20
                        ],
                        'heatmap-opacity': [
                            'interpolate', ['linear'], ['zoom'],
                            5, 0.7,
                            9, 0
                        ]
                    }
                }, 'renewable-plants-layer');

                map.addSource('data-centers', {
                    type: 'geojson',
                    data: '/data-centers.geojson'
                });

                map.addLayer({
                    id: 'data-centers-glow',
                    type: 'circle',
                    source: 'data-centers',
                    minzoom: 5,
                    paint: {
                        'circle-color': '#3b82f6',
                        'circle-radius': [
                            'interpolate', ['linear'], ['zoom'],
                            5, 14,
                            9, 28,
                            13, 42
                        ],
                        'circle-opacity': 0.35,
                        'circle-blur': 0.6
                    }
                });

                map.addLayer({
                    id: 'data-centers-layer',
                    type: 'circle',
                    source: 'data-centers',
                    minzoom: 5,
                    paint: {
                        'circle-color': '#3b82f6',
                        'circle-radius': [
                            'interpolate', ['linear'], ['zoom'],
                            5, 4,
                            9, 8,
                            13, 12
                        ],
                        'circle-opacity': 0.92,
                        'circle-stroke-width': 1.5,
                        'circle-stroke-color': '#60a5fa'
                    }
                });

                // Potential AI data center sites: glow + pin, visible at all zoom levels
                map.addSource('potential-sites', {
                    type: 'geojson',
                    data: '/potential-sites.geojson'
                });

                map.addLayer({
                    id: 'potential-sites-glow',
                    type: 'circle',
                    source: 'potential-sites',
                    paint: {
                        'circle-color': '#8B5CF6',
                        'circle-radius': [
                            'interpolate', ['linear'], ['zoom'],
                            0, 8,
                            5, 18,
                            10, 32,
                            14, 48
                        ],
                        'circle-opacity': 0.4,
                        'circle-blur': 0.7
                    }
                });

                const potentialPinSvg = 'data:image/svg+xml,' + encodeURIComponent(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">' +
                    '<path fill="%238B5CF6" stroke="%23a78bfa" stroke-width="1.5" d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z"/>' +
                    '<circle fill="%23fff" cx="16" cy="16" r="5"/>' +
                    '</svg>'
                );

                map.loadImage(potentialPinSvg, (err, image) => {
                    if (err || !image) {
                        map.addLayer({
                            id: 'potential-sites-layer',
                            type: 'circle',
                            source: 'potential-sites',
                            paint: {
                                'circle-color': '#ffffff',
                                'circle-radius': ['interpolate', ['linear'], ['zoom'], 0, 5, 10, 10, 18, 16],
                                'circle-stroke-width': 2.5,
                                'circle-stroke-color': '#8B5CF6'
                            }
                        });
                        return;
                    }
                    map.addImage('potential-site-pin', image);
                    map.addLayer({
                        id: 'potential-sites-layer',
                        type: 'symbol',
                        source: 'potential-sites',
                        layout: {
                            'icon-image': 'potential-site-pin',
                            'icon-size': ['interpolate', ['linear'], ['zoom'], 0, 0.5, 5, 0.7, 10, 1, 14, 1.2],
                            'icon-allow-overlap': true,
                            'icon-ignore-placement': true,
                            'icon-anchor': 'bottom'
                        }
                    });
                });
            });

            mapRef.current = map;
            console.log("Map Initialized Successfully");

            const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            const popup = new mapboxgl.Popup({
                closeButton: false, // Cleaner look for hovers
                closeOnClick: false,
                offset: [0, -10]     // Shift popup slightly above the circle
            });

            // 1. Show popup on hover
            map.on('mouseenter', 'renewable-plants-layer', (e) => {
                // Change cursor to pointer to show it's interactive
                map.getCanvas().style.cursor = 'pointer';

                const features = e.features;
                if (!features || features.length === 0) return;

                const feature = features[0];

                // Cast coordinates to [number, number]
                const coordinates = (feature.geometry as any).coordinates.slice() as [number, number];

                // Cast properties so TS knows it's an object
                const properties = feature.properties as any;
                const name = properties?.plant_name || 'Unknown Plant';

                // Ensure popup appears over the right copy if map is zoomed out
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                popup.setLngLat(coordinates)
                    .setHTML(`<div style="padding: 5px;"><strong>${name}</strong></div>`)
                    .addTo(map);
            });

            // 2. Hide popup when mouse leaves
            map.on('mouseleave', 'renewable-plants-layer', () => {
                map.getCanvas().style.cursor = ''; // Reset cursor
                popup.remove();
            });

            // Data center hover popup
            const dataCenterPopup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                offset: [0, -10]
            });

            map.on('mouseenter', 'data-centers-layer', (e) => {
                map.getCanvas().style.cursor = 'pointer';
                const features = e.features;
                if (!features || features.length === 0) return;
                const feature = features[0];
                const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
                const props = feature.properties as Record<string, unknown>;
                const title = (props?.Title as string) || 'Data Center';
                const owner = (props?.Owner as string) || '';
                const powerMw = props?.['Current power (MW)'];
                const powerStr = powerMw !== undefined && powerMw !== '' ? ` · ${powerMw} MW` : '';
                const html = `<div style="padding: 6px 8px; font-size: 13px;"><strong>${title}</strong>${owner ? `<br/><span>${owner}</span>` : ''}${powerStr ? `<br/>${powerStr}` : ''}</div>`;
                dataCenterPopup.setLngLat(coords).setHTML(html).addTo(map);
            });

            map.on('mouseleave', 'data-centers-layer', () => {
                map.getCanvas().style.cursor = '';
                dataCenterPopup.remove();
            });

            // Potential sites: clickable location markers
            const potentialSitePopup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: true,
                offset: [0, -12]
            });

            map.on('click', 'potential-sites-layer', (e) => {
                const features = e.features;
                if (!features || features.length === 0) return;
                const feature = features[0];
                const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
                const props = feature.properties as Record<string, unknown>;
                const name = (props?.name as string) || 'Potential Site';
                const reason = (props?.reason as string) || 'Strong intersection of transmission lines, fiber corridors, and renewable power.';
                const slug = name.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                const moreUrl = `/dashboard/${encodeURIComponent(slug)}`;
                const html = `<div style="padding: 8px 10px; max-width: 240px;"><strong style="color: #4c1d95;">${escapeHtml(name)}</strong><br/><span style="font-size: 12px; color: #5b21b6;">Potential AI data center location</span><br/><span style="font-size: 11px; color: #6b7280;">${escapeHtml(reason)}</span><br/><a href="${moreUrl}" style="display: inline-block; margin-top: 8px; font-size: 12px; color: #7c3aed; font-weight: 600;">More →</a></div>`;
                potentialSitePopup.setLngLat(coords).setHTML(html).addTo(map);
            });

            map.on('mouseenter', 'potential-sites-layer', () => {
                map.getCanvas().style.cursor = 'pointer';
            });
            map.on('mouseleave', 'potential-sites-layer', () => {
                map.getCanvas().style.cursor = '';
            });
            } catch (e) {
                console.error("Mapbox failed to load:", e);
            }
        };

        const t = requestAnimationFrame(() => init());
        return () => {
            cancelAnimationFrame(t);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [center[0], center[1], zoom]);

    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: compact ? '100%' : '500px',
        minHeight: compact ? 360 : 400,
        position: 'relative',
    };

    if (!mapboxToken) {
        return (
            <div style={{ ...containerStyle, background: '#ECE9F6', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6680', padding: 24, textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '1rem' }}>Map requires <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 }}>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in <code style={{ background: 'rgba(0,0,0,0.06)', padding: '2px 6px', borderRadius: 4 }}>.env.local</code></p>
            </div>
        );
    }

    return (
        <div style={{ ...containerStyle, position: 'relative' }}>
            <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0 }} />
            <div style={legendStyle.wrapper}>
                <div style={legendStyle.title}>Legend</div>
                <div style={legendStyle.row}>
                    <span style={{ ...legendStyle.line, background: '#a78bfa' }} />
                    <span style={legendStyle.label}>Fiber corridors</span>
                </div>
                <div style={legendStyle.row}>
                    <span style={{ ...legendStyle.line, background: '#94a3b8' }} />
                    <span style={legendStyle.label}>Transmission lines</span>
                </div>
                <div style={legendStyle.row}>
                    <span style={{ ...legendStyle.dot, background: '#fcd34d' }} />
                    <span style={legendStyle.label}>Renewable (solar / wind / hydro)</span>
                </div>
                <div style={legendStyle.row}>
                    <span style={{ ...legendStyle.gradient }} />
                    <span style={legendStyle.label}>Renewable density</span>
                </div>
                <div style={legendStyle.row}>
                    <span style={{ ...legendStyle.dot, background: '#3b82f6' }} />
                    <span style={legendStyle.label}>Existing data centers</span>
                </div>
                <div style={legendStyle.row}>
                    <span style={legendStyle.pin} />
                    <span style={legendStyle.label}>Potential AI data center sites</span>
                </div>
            </div>
        </div>
    );
};

const legendStyle: Record<string, React.CSSProperties> = {
    wrapper: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        background: 'rgba(251, 250, 255, 0.95)',
        border: '1px solid #E3DEF0',
        borderRadius: 12,
        padding: '10px 14px',
        boxShadow: '0 2px 12px rgba(94, 76, 138, 0.08)',
        fontSize: 12,
        color: '#5E4C8A',
        zIndex: 10,
    },
    title: {
        fontWeight: 600,
        marginBottom: 8,
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#7E6BAF',
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5,
    },
    label: {
        lineHeight: 1.3,
    },
    line: {
        width: 20,
        height: 3,
        borderRadius: 2,
        flexShrink: 0,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        flexShrink: 0,
    },
    gradient: {
        width: 20,
        height: 10,
        borderRadius: 4,
        flexShrink: 0,
        background: 'linear-gradient(90deg, rgba(103,232,249,0.5), rgba(167,139,250,0.8))',
    },
    pin: {
        width: 10,
        height: 12,
        flexShrink: 0,
        background: '#8B5CF6',
        borderRadius: '50% 50% 50% 0',
        transform: 'rotate(-45deg)',
        border: '1.5px solid #a78bfa',
    },
};

export default TexasMap;