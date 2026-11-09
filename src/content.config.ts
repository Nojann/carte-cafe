import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Chaque texte traduisible doit exister dans les 3 langues : le build échoue sinon.
const text = z.object({
  fr: z.string().min(1),
  en: z.string().min(1),
  es: z.string().min(1),
});
const textList = z.object({
  fr: z.array(z.string().min(1)).min(1),
  en: z.array(z.string().min(1)).min(1),
  es: z.array(z.string().min(1)).min(1),
});
const urls = z.object({ fr: z.url(), en: z.url(), es: z.url() });
const coords = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
const photo = z.object({ src: z.string(), alt: text });
const score = z.number().int().min(1).max(5);

// Départements de Colombie mis en avant sur la carte.
const regions = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/regions' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    // Nom officiel, écrit comme en Colombie (non traduit).
    nom: z.string().min(1),
    // Code ISO 3166-2 du département, ex. CO-CAU : relie la région à son contour.
    iso: z.string().regex(/^CO-[A-Z]{3}$/),
    description: text.optional(),
    // Photo de terroir : sert aussi de repli aux cafés de la région sans photo.
    photo: photo.optional(),
    ordre: z.number().int().default(0),
  }),
});

const cafes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cafes' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    nom: text,
    pays: z.literal('CO'),
    region: reference('regions'),
    // Commune ou lieu-dit, affiché après la région.
    localite: z.string().optional(),
    coordonnees: coords,
    producteur: z.string().optional(),
    altitude: z.object({ min: z.number(), max: z.number() }).optional(),
    varietes: z.array(z.string()).optional(),
    process: z.enum(['lave', 'nature', 'honey', 'semi-lave', 'anaerobie']).optional(),
    recolte: z.string().optional(),
    notes: textList,
    profil: z.object({ acidite: score, corps: score, douceur: score }).optional(),
    histoire: text.optional(),
    photos: z.array(photo).min(1),
    // Un même café peut être proposé en plusieurs torréfactions.
    torrefactions: z
      .array(
        z.object({
          niveau: z.enum(['claire', 'moyenne', 'foncee']),
          usage: z.enum(['filtre', 'espresso', 'omni']),
          // Page produit sur l'ancien site (plus utilisée par les boutons : la boutique est interne).
          lien: urls.optional(),
          // Décision du 6 nov. : CHF uniquement.
          devise: z.literal('CHF').default('CHF'),
          // Formats vendus (250 g, 500 g, 1 kg…), du plus petit au plus grand.
          formats: z
            .array(z.object({ poids_g: z.number().int().positive(), montant: z.number().positive() }))
            .min(1)
            .refine((f) => new Set(f.map((x) => x.poids_g)).size === f.length, {
              message: 'Deux formats ont le même poids.',
            })
            .transform((f) => [...f].sort((a, b) => a.poids_g - b.poids_g)),
          disponible: z.boolean(),
        }),
      )
      .min(1),
  }),
});

// Lieux de vente en Suisse (food truck).
const lieux = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/lieux' }),
  schema: z
    .object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      nom: text,
      type: z.enum(['marche', 'evenement', 'emplacement']),
      adresse: z.string().min(1),
      coordonnees: coords,
      horaires: text,
      // Obligatoire pour un événement : il disparaît de la carte une fois passé.
      dates: z.object({ debut: z.coerce.date(), fin: z.coerce.date() }).optional(),
      lien_maps: z.url().optional(),
      photo: photo.optional(),
      // true = donnée fictive, à remplacer.
      exemple: z.boolean().default(false),
    })
    .refine((l) => l.type !== 'evenement' || l.dates, {
      message: 'Un lieu de type « evenement » doit avoir des dates.',
      path: ['dates'],
    }),
});

export const collections = { regions, cafes, lieux };
