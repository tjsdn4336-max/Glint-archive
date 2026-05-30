import { NextRequest, NextResponse } from 'next/server';

const SPECIES_IMAGES: Record<string, string> = {
  'leopard-gecko':   'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Leopard_gecko_%28Eublepharis_macularius%29.jpg/800px-Leopard_gecko_%28Eublepharis_macularius%29.jpg',
  'ball-python':     'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Ball_python_lucy.JPG/800px-Ball_python_lucy.JPG',
  'crested-gecko':   'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Crested_gecko_-_Correlophus_ciliatus.jpg/800px-Crested_gecko_-_Correlophus_ciliatus.jpg',
  'bearded-dragon':  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Pogona_vitticeps_2.jpg/800px-Pogona_vitticeps_2.jpg',
  'fat-tailed-gecko':'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Hemitheconyx_caudicinctus_%28African_fat-tailed_gecko%29.jpg/800px-Hemitheconyx_caudicinctus_%28African_fat-tailed_gecko%29.jpg',
  'gargoyle-gecko':  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Rhacodactylus_auriculatus01.jpg/800px-Rhacodactylus_auriculatus01.jpg',
  'blue-tongue-skink':'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Easternblue-tonguedlizard.jpg/800px-Easternblue-tonguedlizard.jpg',
  'corn-snake':      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Elaphe_guttata_CDC.jpg/800px-Elaphe_guttata_CDC.jpg',
  'chameleon':       'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Chaqmeleon.jpg/800px-Chaqmeleon.jpg',
  'ackie-monitor':   'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Varanus_acanthurus_01.jpg/800px-Varanus_acanthurus_01.jpg',
  'pacman-frog':     'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Ceratophrys_ornata.jpg/800px-Ceratophrys_ornata.jpg',
  'axolotl':         'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Axolotl_ganz.jpg/800px-Axolotl_ganz.jpg',
};

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug || !SPECIES_IMAGES[slug]) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }
  return NextResponse.json({ url: SPECIES_IMAGES[slug] });
}
