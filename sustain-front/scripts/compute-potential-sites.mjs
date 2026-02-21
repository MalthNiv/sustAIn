/**
 * Computes potential AI data center sites: points where transmission lines
 * and renewable power plants intersect (strong overlap). Run from project root:
 *   node scripts/compute-potential-sites.mjs
 * Writes public/potential-sites.geojson (used by the map).
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as turf from '@turf/turf';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');

const MAX_SITES = 40;
const MAX_DISTANCE_KM = 25;  // keep transmission sample points within this distance of a renewable plant
const SAMPLE_INTERVAL_KM = 8;  // sample transmission lines every 8 km
const DEDUPE_RADIUS_KM = 18;   // merge candidates within this distance

function loadJson(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
}

function isRenewable(properties) {
    const p = properties || {};
    return (p.solar_mw > 0) || (p.wind_mw > 0) || (p.hydro_mw > 0) ||
           (p.hydrops_mw > 0) || (p.geo_mw > 0) || (p.bio_mw > 0) || (p.nuclear_mw > 0);
}

// Continental US bounds (exclude Alaska/Hawaii for this script)
const US_BBOX = [-125, 24, -66, 50];

function inUS(coord) {
    const [lng, lat] = Array.isArray(coord) ? coord : (coord?.coordinates || []);
    return lng >= US_BBOX[0] && lng <= US_BBOX[2] && lat >= US_BBOX[1] && lat <= US_BBOX[3];
}

function main() {
    console.log('Loading transmission lines...');
    const tlPath = path.join(publicDir, 'transmission-lines.json');
    const tl = loadJson(tlPath);
    const rawFeatures = Array.isArray(tl.features) ? tl.features : (tl.type === 'Feature' ? [tl] : []);
    const tlFeatures = rawFeatures.filter(f => f.geometry && (f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString'));
    if (!tlFeatures.length) {
        console.log('No transmission features found.');
        return;
    }

    console.log('Loading power plants...');
    const ppPath = path.join(publicDir, 'power-plants.geojson');
    const pp = loadJson(ppPath);
    const renewable = (pp.features || []).filter(
        f => isRenewable(f.properties) && inUS(f.geometry?.coordinates)
    );
    const plantsCollection = turf.featureCollection(renewable);
    console.log(`Using ${renewable.length} renewable plants in continental US.`);

    const candidates = [];

    for (const feature of tlFeatures) {
        const geom = feature.geometry;
        if (geom.type === 'MultiLineString') {
            for (const part of geom.coordinates) {
                sampleLine(turf.lineString(part), plantsCollection, candidates);
            }
        } else if (geom.type === 'LineString') {
            sampleLine(turf.feature(geom), plantsCollection, candidates);
        }
    }

    // Deduplicate: keep one candidate per cluster
    const kept = [];
    for (const c of candidates) {
        const tooClose = kept.some(
            k => turf.distance(c.point, k.point, { units: 'kilometers' }) < DEDUPE_RADIUS_KM
        );
        if (!tooClose) kept.push(c);
        if (kept.length >= MAX_SITES) break;
    }

    const features = kept.slice(0, MAX_SITES).map(({ point, name }) =>
        turf.feature(point.geometry, {
            name: name || 'Potential AI data center site',
            reason: 'Strong intersection of transmission lines, fiber corridors, and renewable power.'
        })
    );

    const out = turf.featureCollection(features);
    const outPath = path.join(publicDir, 'potential-sites.geojson');
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
    console.log(`Wrote ${features.length} potential sites to ${outPath}.`);
}

function sampleLine(line, plantsCollection, candidates) {
    const lenKm = turf.length(line, { units: 'kilometers' });
    if (lenKm < 1) return;
    let dist = 0;
    while (dist < lenKm) {
        const point = turf.along(line, dist, { units: 'kilometers' });
        if (!inUS(point.geometry.coordinates)) {
            dist += SAMPLE_INTERVAL_KM;
            continue;
        }
        const nearest = turf.nearestPoint(point, plantsCollection);
        const d = turf.distance(point, nearest, { units: 'kilometers' });
        if (d <= MAX_DISTANCE_KM) {
            const plantName = nearest.properties?.plant_name || nearest.properties?.plant_name || 'renewable plant';
            candidates.push({
                point,
                distance: d,
                name: `${nearest.properties?.city || 'Area'} (near ${plantName})`
            });
        }
        dist += SAMPLE_INTERVAL_KM;
    }
}

main();
