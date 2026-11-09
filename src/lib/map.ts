// Génération de la carte au moment du build : le navigateur reçoit un SVG prêt à l'emploi,
// sans télécharger de données géographiques ni de bibliothèque de cartographie.
//
// Composition : un planisphère sobre + deux « loupes » posées dessus (Colombie, Suisse),
// chacune avec sa propre projection. Le trajet réel du café est dessiné sur le fond.
import { geoContains, geoEqualEarth, geoGraticule10, geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import world110 from 'world-atlas/countries-110m.json';
import world50 from 'world-atlas/countries-50m.json';
import departamentosJson from '../data/colombia-departamentos.geo.json';
import { countryIds, neighbourIds } from './countries';
import { landRoute, ports, seaRoute } from '../data/route';

export const MAP_WIDTH = 1000;
const ANTARCTICA = '010';
/** Résolution du repère interne des loupes par rapport au repère du monde. */
const INSET_SCALE = 2;

/** Position des loupes, en unités du viewBox du monde (largeur 1000, hauteur ≈ 455). */
const INSETS = {
  co: { x: 12, y: 172, w: 255, h: 276 }, // Pacifique, à gauche de l'Amérique du Sud
  ch: { x: 580, y: 8, w: 300, h: 212 }, // Russie : laisse l'Atlantique libre pour la route maritime
} as const;
type InsetKey = keyof typeof INSETS;

type LatLng = { lat: number; lng: number };
type Pt = { x: number; y: number; fixed?: boolean };
type Department = Feature<Geometry, { nombre: string; iso: string }>;

const departments = (departamentosJson as unknown as FeatureCollection<Geometry, Department['properties']>)
  .features as Department[];

/** Vrai si le point est à l'intérieur du département (code ISO 3166-2, ex. CO-CAU). */
export function isInDepartment(iso: string, p: LatLng) {
  const d = departments.find((f) => f.properties.iso === iso);
  return !!d && geoContains(d, [p.lng, p.lat]);
}

const r1 = (v: number) => Math.round(v * 10) / 10;
const pct = (v: number, total: number) => Number(((v / total) * 100).toFixed(3));

function countriesOf(topo: unknown) {
  const t = topo as Topology<{ countries: GeometryCollection }>;
  return (feature(t, t.objects.countries) as FeatureCollection<Geometry>).features;
}

/** Écarte légèrement les points trop proches, sans sortir du cadre `bounds` (modifie le tableau). */
function spread<T extends Pt>(pts: T[], min: number, bounds?: [[number, number], [number, number]]) {
  const keepIn = (p: Pt) => {
    if (!bounds) return;
    p.x = Math.min(Math.max(p.x, bounds[0][0]), bounds[1][0]);
    p.y = Math.min(Math.max(p.y, bounds[0][1]), bounds[1][1]);
  };
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < min) {
          // Un point `fixed` ne bouge pas : l'autre s'écarte de toute la distance.
          const share = a.fixed ? 0 : b.fixed ? 1 : 0.5;
          const push = min - dist;
          const ux = dist ? dx / dist : 1, uy = dist ? dy / dist : 0;
          a.x += ux * push * share; a.y += uy * push * share;
          b.x -= ux * push * (1 - share); b.y -= uy * push * (1 - share);
          keepIn(a); keepIn(b);
        }
      }
    }
  }
  return pts;
}

/** Repère et projection d'une loupe, cadrée sur `target`. */
function makeInset(key: InsetKey, target: Feature | FeatureCollection, world: Feature[]) {
  const box = INSETS[key];
  const W = box.w * INSET_SCALE, H = box.h * INSET_SCALE;
  const pad = 0.06 * W;
  const padTop = 0.12 * H; // place pour le titre de la loupe
  const projection = geoMercator().fitExtent([[pad, padTop], [W - pad, H - pad]], target);
  projection.clipExtent([[0, 0], [W, H]]);
  const path = geoPath(projection).digits(1);
  const ids = new Set<string>(neighbourIds[key]);
  const neighbours = world
    .filter((f) => ids.has(String(f.id)))
    .map((f) => path(f) ?? '')
    .filter(Boolean);
  const project = (p: LatLng): Pt => {
    const [x, y] = projection([p.lng, p.lat])!;
    return { x, y };
  };
  const toPct = (p: Pt) => ({ xPct: pct(p.x, W), yPct: pct(p.y, H) });
  return { box, W, H, path, neighbours, project, toPct };
}

/** Écarte verticalement des libellés trop proches (modifie le tableau). */
function unstack<T extends { y: number }>(labels: T[], min: number) {
  const sorted = [...labels].sort((a, b) => a.y - b.y);
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].y - sorted[i - 1].y;
      if (gap < min) {
        sorted[i - 1].y -= (min - gap) / 2;
        sorted[i].y += (min - gap) / 2;
      }
    }
  }
  return labels;
}

interface MapInput {
  regions: { slug: string; iso: string }[];
  places: { slug: string; coordonnees: LatLng }[];
  roastery: LatLng;
}

export function buildMap({ regions, places, roastery }: MapInput) {
  // ---- Monde ----
  const world = countriesOf(world110).filter((f) => String(f.id) !== ANTARCTICA);
  const worldFc: FeatureCollection = { type: 'FeatureCollection', features: world };
  const projection = geoEqualEarth().fitWidth(MAP_WIDTH, worldFc);
  // Fond du monde : une précision à l'unité suffit et allège nettement le SVG.
  const path = geoPath(projection).digits(0);
  const [[, y0], [, y1]] = path.bounds(worldFc);
  const pad = 8;
  const [tx, ty] = projection.translate();
  projection.translate([tx, ty - y0 + pad]);
  const height = Math.ceil(y1 - y0 + pad * 2);
  const project = (p: LatLng): Pt => {
    const [x, y] = projection([p.lng, p.lat])!;
    return { x, y };
  };

  const featureOf = (fs: Feature[], id: string) => fs.find((f) => String(f.id) === id)!;
  const shapes = world.map((f) => {
    const id = String(f.id);
    return { d: path(f) ?? '', key: id === countryIds.CO ? 'co' : id === countryIds.CH ? 'ch' : null };
  });
  const outline = path({ type: 'Sphere' }) ?? '';

  // Trajet du café : voie maritime puis Rhin et route (src/data/route.ts).
  const line = (coordinates: [number, number][]) => ({ type: 'LineString' as const, coordinates });
  const sea = line(seaRoute);
  const land = line(landRoute(roastery));
  const fine = geoPath(projection).digits(1);
  const portAt = (at: [number, number]) => project({ lng: at[0], lat: at[1] });
  const route = {
    sea: fine(sea) ?? '',
    land: fine(land) ?? '',
    ports: [
      { name: ports.depart.name, ...portAt(ports.depart.at), anchor: 'start' as const },
      { name: ports.arrivee.name, ...portAt(ports.arrivee.at), anchor: 'end' as const },
    ],
  };
  const graticule = path(geoGraticule10()) ?? '';

  // Traits de rappel : du vrai pays vers le bord le plus proche de sa loupe.
  const leader = (id: string, key: InsetKey) => {
    const [cx, cy] = path.centroid(featureOf(world, id));
    const b = INSETS[key];
    const ex = Math.min(Math.max(cx, b.x), b.x + b.w);
    const ey = Math.min(Math.max(cy, b.y), b.y + b.h);
    return `M${r1(cx)},${r1(cy)}L${r1(ex)},${r1(ey)}`;
  };
  const leaders = [leader(countryIds.CO, 'co'), leader(countryIds.CH, 'ch')];

  const insetStyle = (key: InsetKey) => {
    const b = INSETS[key];
    return `left:${pct(b.x, MAP_WIDTH)}%;top:${pct(b.y, height)}%;width:${pct(b.w, MAP_WIDTH)}%`;
  };

  // ---- Loupe Colombie ----
  const world50Features = countriesOf(world50);
  const co = makeInset('co', { type: 'FeatureCollection', features: departments }, world50Features);
  const regionByIso = new Map(regions.map((r) => [r.iso, r.slug]));
  const deptShapes = departments.map((d) => ({ d: co.path(d) ?? '', region: regionByIso.get(d.properties.iso) }));
  const coOutline = co.path(featureOf(world50Features, countryIds.CO)) ?? '';
  const regionGeo = regions.map((r) => {
    const d = departments.find((f) => f.properties.iso === r.iso);
    if (!d) throw new Error(`Région « ${r.slug} » : département ${r.iso} introuvable dans colombia-departamentos.geo.json`);
    const [cx, cy] = co.path.centroid(d);
    const [, [bx1]] = co.path.bounds(d);
    // Libellé posé contre le bord est du département.
    return { slug: r.slug, d: co.path(d) ?? '', cx, cy, label: { x: bx1, y: cy } };
  });
  unstack(regionGeo.map((r) => r.label), 0.11 * co.H);
  const regionShapes = regionGeo.map((r) => ({
    slug: r.slug,
    d: r.d,
    center: co.toPct({ x: r.cx, y: r.cy }), // point visé par le zoom
    label: co.toPct(r.label),
  }));
  const coPort = co.toPct(co.project({ lng: ports.depart.at[0], lat: ports.depart.at[1] }));

  // ---- Loupe Suisse ----
  const chFeature = featureOf(world50Features, countryIds.CH);
  const ch = makeInset('ch', chFeature, world50Features);
  const chPins = spread(
    [{ slug: '', fixed: true, ...ch.project(roastery) }, ...places.map((p) => ({ slug: p.slug, ...ch.project(p.coordonnees) }))],
    0.13 * ch.W,
    [[0.1 * ch.W, 0.2 * ch.H], [0.9 * ch.W, 0.88 * ch.H]],
  );
  const roasteryPin = chPins[0];
  const trucks = chPins.slice(1).map((p) => ({ ...p, ...ch.toPct(p) }));

  return {
    width: MAP_WIDTH,
    height,
    shapes,
    outline,
    graticule,
    leaders,
    route,
    co: {
      style: insetStyle('co'),
      width: co.W,
      height: co.H,
      neighbours: co.neighbours,
      outline: coOutline,
      departments: deptShapes,
      regions: regionShapes,
      route: co.path(sea) ?? '',
      port: { name: ports.depart.name, ...coPort },
    },
    ch: {
      style: insetStyle('ch'),
      width: ch.W,
      height: ch.H,
      neighbours: ch.neighbours,
      country: ch.path(chFeature) ?? '',
      roastery: ch.toPct(roasteryPin),
      route: ch.path(land) ?? '',
      trucks,
    },
  };
}
