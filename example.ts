type Bougnoul = { oqtf: boolean; country: string };

type People = string[];

const people: People = [];
// const bougnouls: { oqtf: boolean; country: string }[] = [{ oqtf: true, country: 'France' }];
const bougnouls: Bougnoul[] = [{ oqtf: true, country: 'France' }];

people.push(bougnouls[0].country);
