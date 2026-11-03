// Génération de la carte au moment du build : le navigateur reçoit un SVG prêt à l'emploi,
// sans télécharger de données géographiques ni de bibliothèque de cartographie.
import { geoEqualEarth, geoGraticule10, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world from 'world-atlas/countries-110m.json';
import { producingCountries, type CountryCode } from './countries';

export const MAP_WIDTH = 1000;
const ANTARCTICA = '010';
const TROPIC = 23.44;

type Point = { slug: string; lat: number; lng: number };
export type ProjectedPoint = { slug: string; x: number; y: number; xPct: number; yPct: number };
type LatLng = { lat: number; lng: number };

export function buildMap(origins: CountryCode[], points: Point[], destinationGeo: LatLng) {
  const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
  const all = feature(topo, topo.objects.countries) as FeatureCollection<Geometry>;
  const countries = all.features.filter((f) => String(f.id) !== ANTARCTICA);

  const projection = geoEqualEarth().fitWidth(MAP_WIDTH, { type: 'FeatureCollection', features: countries });
  const path = geoPath(projection).digits(1);
  const [[, y0], [, y1]] = path.bounds({ type: 'FeatureCollection', features: countries });
  const pad = 8;
  const [tx, ty] = projection.translate();
  projection.translate([tx, ty - y0 + pad]);
  const height = Math.ceil(y1 - y0 + pad * 2);

  const originIds = new Set<string>(origins.map((c) => producingCountries[c]));
  const shapes = countries.map((f) => ({
    d: path(f) ?? '',
    origin: originIds.has(String(f.id)),
  }));

  const outline = path({ type: 'Sphere' }) ?? '';
  const graticule = path(geoGraticule10()) ?? '';
  const north = projection([0, TROPIC])![1];
  const south = projection([0, -TROPIC])![1];

  // Projection des points + léger écartement des marqueurs trop proches
  const projected = points.map((p) => {
    const [x, y] = projection([p.lng, p.lat])!;
    return { slug: p.slug, x, y };
  });
  const MIN_DIST = 16;
  for (let i = 0; i < projected.length; i++) {
    for (let j = 0; j < i; j++) {
      const a = projected[i], b = projected[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < MIN_DIST) {
        const push = (MIN_DIST - dist) / 2;
        const ux = dist ? dx / dist : 1, uy = dist ? dy / dist : 0;
        a.x += ux * push; a.y += uy * push;
        b.x -= ux * push; b.y -= uy * push;
      }
    }
  }
  const markers: ProjectedPoint[] = projected.map((p) => ({
    ...p,
    xPct: (p.x / MAP_WIDTH) * 100,
    yPct: (p.y / height) * 100,
  }));

  const [dx, dy] = projection([destinationGeo.lng, destinationGeo.lat])!;
  const destination = { x: dx, y: dy, xPct: (dx / MAP_WIDTH) * 100, yPct: (dy / height) * 100 };

  // Arc stylisé origine → destination : Bézier quadratique bombée vers le nord.
  const r = (v: number) => Math.round(v * 10) / 10;
  const routes = markers.map((m) => {
    const vx = dx - m.x, vy = dy - m.y;
    const len = Math.hypot(vx, vy) || 1;
    let nx = -vy / len, ny = vx / len; // perpendiculaire
    if (ny > 0) { nx = -nx; ny = -ny; } // toujours vers le haut
    const bend = 0.3 * len;
    const cx = (m.x + dx) / 2 + nx * bend;
    const cy = Math.max(4, (m.y + dy) / 2 + ny * bend);
    return { slug: m.slug, d: `M${r(m.x)},${r(m.y)}Q${r(cx)},${r(cy)} ${r(dx)},${r(dy)}` };
  });

  return {
    width: MAP_WIDTH, height, shapes, outline, graticule,
    belt: { y: north, h: south - north }, markers, destination, routes,
  };
}
