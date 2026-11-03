import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { countryCodes } from './lib/countries';

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
const score = z.number().int().min(1).max(5);

const cafes = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/cafes' }),
  schema: z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    nom: text,
    pays: z.enum(countryCodes),
    region: text,
    coordonnees: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    producteur: z.string().optional(),
    altitude: z.object({ min: z.number(), max: z.number() }).optional(),
    varietes: z.array(z.string()).optional(),
    process: z.enum(['lave', 'nature', 'honey', 'semi-lave', 'anaerobie']).optional(),
    recolte: z.string().optional(),
    notes: textList,
    profil: z.object({ acidite: score, corps: score, douceur: score }).optional(),
    histoire: text.optional(),
    photos: z.array(z.object({ src: z.string(), alt: text })).min(1),
    lien: z.object({ fr: z.url(), en: z.url(), es: z.url() }),
    prix: z
      .object({
        montant: z.number().positive(),
        devise: z.string().length(3),
        poids_g: z.number().int().positive(),
      })
      .optional(),
    disponible: z.boolean(),
  }),
});

export const collections = { cafes };
