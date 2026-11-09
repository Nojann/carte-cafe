// Trajet réel du café, de la Colombie à la torréfaction (dessiné sur le fond de carte).
// Points de passage [longitude, latitude] : entre deux points, le tracé suit le plus court
// chemin sur le globe, d'où les points intermédiaires pour contourner les côtes.

type LngLat = [number, number];

export const ports = {
  depart: { name: 'Buenaventura', at: [-77.07, 3.89] as LngLat },
  arrivee: { name: 'Rotterdam', at: [4.05, 51.95] as LngLat },
};

/** Voie maritime : Buenaventura → canal de Panamá → mer des Caraïbes → Atlantique → Rotterdam. */
export const seaRoute: LngLat[] = [
  ports.depart.at,
  [-77.6, 3.85], // sortie de la baie de Buenaventura
  [-78.3, 5.2],
  [-79.0, 7.0], // golfe de Panamá
  [-79.55, 8.88], // Balboa, entrée Pacifique du canal
  [-79.9, 9.36], // Colón, sortie Caraïbes
  [-79.4, 10.6],
  [-72.0, 15.0], // mer des Caraïbes
  [-68.2, 17.6],
  [-67.8, 18.6], // passage de la Mona
  [-64.0, 21.0],
  [-35.0, 36.0], // Atlantique Nord
  [-15.0, 45.0],
  [-5.8, 48.6], // Ouessant
  [-1.0, 50.1], // Manche
  [1.6, 51.1], // pas de Calais
  [3.5, 51.95],
  ports.arrivee.at,
];

/** Voie terrestre : barge sur le Rhin jusqu'à Bâle, puis route jusqu'à la torréfaction. */
export const landRoute = (roastery: { lat: number; lng: number }): LngLat[] => [
  ports.arrivee.at,
  [4.45, 51.92], // Rotterdam
  [5.9, 51.85], // Nimègue
  [6.76, 51.43], // Duisbourg
  [6.96, 50.94], // Cologne
  [7.6, 50.36], // Coblence
  [8.27, 50.0], // Mayence
  [8.47, 49.49], // Mannheim
  [7.75, 48.58], // Strasbourg
  [7.59, 47.56], // Bâle (Rhin)
  [7.25, 47.14], // Bienne
  [roastery.lng, roastery.lat],
];
