const DESTINATION_PHOTOS: Record<string, string> = {
  // Brasil — Sul
  'gramado':                 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1600&h=600&fit=crop',
  'canela':                  'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1600&h=600&fit=crop',
  'florianopolis':           'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'florianópolis':           'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'bombinhas':               'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'balneario camboriu':      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'balneário camboriú':      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'curitiba':                'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&h=600&fit=crop',
  'foz do iguacu':           'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=600&fit=crop',
  'foz do iguaçu':           'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=600&fit=crop',
  // Brasil — Sudeste
  'rio de janeiro':          'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&h=600&fit=crop',
  'sao paulo':               'https://images.unsplash.com/photo-1578002171197-8d4d1d9a3bb2?w=1600&h=600&fit=crop',
  'são paulo':               'https://images.unsplash.com/photo-1578002171197-8d4d1d9a3bb2?w=1600&h=600&fit=crop',
  'monte verde':             'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'campos do jordao':        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'campos do jordão':        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'paraty':                  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&h=600&fit=crop',
  'parati':                  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&h=600&fit=crop',
  'angra dos reis':          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'petropolis':              'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'petrópolis':              'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=600&fit=crop',
  'buzios':                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'búzios':                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  // Brasil — Nordeste
  'salvador':                'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=1600&h=600&fit=crop',
  'porto seguro':            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'trancoso':                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'morro de sao paulo':      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'morro de são paulo':      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'fortaleza':               'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'jericoacoara':            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'natal':                   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'recife':                  'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=1600&h=600&fit=crop',
  'olinda':                  'https://images.unsplash.com/photo-1548366086-7f1b76106622?w=1600&h=600&fit=crop',
  'maceio':                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'maceió':                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'lencois maranhenses':     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'lençóis maranhenses':     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  // Brasil — Norte / Centro-Oeste
  'manaus':                  'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600&h=600&fit=crop',
  'pantanal':                'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600&h=600&fit=crop',
  'bonito':                  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600&h=600&fit=crop',
  'chapada diamantina':      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'chapada dos veadeiros':   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'brasilia':                'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&h=600&fit=crop',
  'brasília':                'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1600&h=600&fit=crop',
  // Internacional
  'paris':                   'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&h=600&fit=crop',
  'roma':                    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&h=600&fit=crop',
  'rome':                    'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&h=600&fit=crop',
  'lisboa':                  'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1600&h=600&fit=crop',
  'lisbon':                  'https://images.unsplash.com/photo-1588392382834-a891154bca4d?w=1600&h=600&fit=crop',
  'barcelona':               'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&h=600&fit=crop',
  'madrid':                  'https://images.unsplash.com/photo-1543785734-4b6e564642f8?w=1600&h=600&fit=crop',
  'amsterdam':               'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600&h=600&fit=crop',
  'londres':                 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=600&fit=crop',
  'london':                  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=600&fit=crop',
  'nova york':               'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1600&h=600&fit=crop',
  'new york':                'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=1600&h=600&fit=crop',
  'miami':                   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'cancun':                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'cancún':                  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=600&fit=crop',
  'buenos aires':            'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?w=1600&h=600&fit=crop',
  'santiago':                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&h=600&fit=crop',
  'tokyo':                   'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=600&fit=crop',
  'tóquio':                  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=600&fit=crop',
  'dubai':                   'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&h=600&fit=crop',
  'bali':                    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1600&h=600&fit=crop',
  'maldivas':                'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&h=600&fit=crop',
  'maldives':                'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1600&h=600&fit=crop',
};

/** Returns a curated Unsplash URL for a destination, or a seeded Picsum fallback. */
export function getDestinationPhoto(destination: string): string {
  const key = destination.toLowerCase().trim();
  if (DESTINATION_PHOTOS[key]) return DESTINATION_PHOTOS[key];
  for (const [mapKey, url] of Object.entries(DESTINATION_PHOTOS)) {
    if (key.includes(mapKey) || mapKey.includes(key)) return url;
  }
  const seed = [...destination].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 1000;
  return `https://picsum.photos/seed/${seed}/1600/600`;
}
