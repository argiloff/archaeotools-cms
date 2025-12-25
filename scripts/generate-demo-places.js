import fs from 'fs';

const bases = [
  { country: 'Italy', city: 'Rome', lat: 41.9028, lng: 12.4964 },
  { country: 'Italy', city: 'Florence', lat: 43.7696, lng: 11.2558 },
  { country: 'Italy', city: 'Naples', lat: 40.8518, lng: 14.2681 },
  { country: 'Austria', city: 'Vienna', lat: 48.2082, lng: 16.3738 },
  { country: 'Austria', city: 'Salzburg', lat: 47.8095, lng: 13.055 },
  { country: 'Austria', city: 'Graz', lat: 47.0707, lng: 15.4395 },
  { country: 'Greece', city: 'Athens', lat: 37.9838, lng: 23.7275 },
  { country: 'Greece', city: 'Thessaloniki', lat: 40.6401, lng: 22.9444 },
  { country: 'Greece', city: 'Heraklion', lat: 35.3387, lng: 25.1442 },
  { country: 'Germany', city: 'Berlin', lat: 52.52, lng: 13.405 },
  { country: 'Germany', city: 'Munich', lat: 48.1351, lng: 11.582 },
  { country: 'Germany', city: 'Hamburg', lat: 53.5511, lng: 9.9937 },
  { country: 'Spain', city: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { country: 'Spain', city: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { country: 'Spain', city: 'Seville', lat: 37.3891, lng: -5.9845 },
];

const placeTypes = ['SITE', 'MUSEUM', 'POI'];

function randomInRange(base, variance) {
  return base + (Math.random() - 0.5) * variance;
}

let total = 0;
const target = 200;
const places = [];

while (total < target) {
  const base = bases[Math.floor(Math.random() * bases.length)];
  const title = `${base.city} Discovery ${total + 1}`;
  const seedBase = `${base.city.toLowerCase()}-${total + 1}`;
  const place = {
    title,
    type: placeTypes[Math.floor(Math.random() * placeTypes.length)],
    description: JSON.stringify({ blocks: [{ type: 'paragraph', data: { text: `${title} notes` } }] }),
    latitude: parseFloat(randomInRange(base.lat, 0.2).toFixed(6)),
    longitude: parseFloat(randomInRange(base.lng, 0.2).toFixed(6)),
    radiusMeters: Math.floor(Math.random() * 400 + 50),
    address: `${Math.floor(Math.random() * 200)} ${base.city} Way`,
    city: base.city,
    country: base.country,
    visited: Math.random() > 0.6,
    photos: Array.from({ length: 2 }).map((_, idx) => ({
      description: `${title} Photo ${idx + 1}`,
      imageUrl: `https://picsum.photos/seed/${seedBase}-${idx}/900/600`,
    })),
  };
  places.push(place);
  total += 1;
}

const dataset = { places };

fs.mkdirSync('public/demo', { recursive: true });
fs.writeFileSync('public/demo/places-eu.json', JSON.stringify(dataset, null, 2));
console.log('Generated public/demo/places-eu.json with', total, 'places');
