export interface Show {
  id: string;
  title: string;
  description: string;
  genres: string[];
  day: string;
  time: string;
  image: string;
}

export const mockShows: Show[] = [
  {
    id: '1',
    title: 'Morning Rhumba Vibes',
    description: 'Start your day with classic Congolese Rhumba from the golden era. Featuring legends like Franco, Tabu Ley, and Sam Mangwana.',
    genres: ['Rhumba', 'Soukous'],
    day: 'Monday',
    time: '6:00 AM - 9:00 AM',
    image: '/assets/generated/show-placeholder-1.dim_800x450.png',
  },
  {
    id: '2',
    title: 'Ndombolo Power Hour',
    description: 'High-energy Ndombolo hits to keep you moving. The best of Koffi Olomide, Fally Ipupa, and Werrason.',
    genres: ['Ndombolo', 'Soukous'],
    day: 'Tuesday',
    time: '7:00 PM - 8:00 PM',
    image: '/assets/generated/show-placeholder-2.dim_800x450.png',
  },
  {
    id: '3',
    title: 'Soukous Legends',
    description: 'Celebrating the pioneers of Soukous music. A journey through the evolution of Congolese dance music.',
    genres: ['Soukous', 'Rhumba'],
    day: 'Wednesday',
    time: '8:00 PM - 10:00 PM',
    image: '/assets/generated/show-placeholder-1.dim_800x450.png',
  },
  {
    id: '4',
    title: 'Afro Zouk Nights',
    description: 'Smooth Afro Zouk rhythms for your evening. Featuring artists like Awilo Longomba and Kanda Bongo Man.',
    genres: ['Afro Zouk', 'Soukous'],
    day: 'Thursday',
    time: '9:00 PM - 11:00 PM',
    image: '/assets/generated/show-placeholder-2.dim_800x450.png',
  },
  {
    id: '5',
    title: 'Friday Night Live',
    description: 'Live DJ sets mixing the best of Rhumba, Soukous, and Ndombolo. Get ready for the weekend!',
    genres: ['Rhumba', 'Soukous', 'Ndombolo'],
    day: 'Friday',
    time: '10:00 PM - 2:00 AM',
    image: '/assets/generated/show-placeholder-1.dim_800x450.png',
  },
  {
    id: '6',
    title: 'Weekend Classics',
    description: 'Timeless African rhythms for a relaxed weekend. From vintage Rhumba to modern Afro Zouk.',
    genres: ['Rhumba', 'Afro Zouk'],
    day: 'Saturday',
    time: '12:00 PM - 4:00 PM',
    image: '/assets/generated/show-placeholder-2.dim_800x450.png',
  },
  {
    id: '7',
    title: 'Sunday Soul Sessions',
    description: 'Soulful Rhumba and Soukous to wind down your week. Perfect for Sunday relaxation.',
    genres: ['Rhumba', 'Soukous'],
    day: 'Sunday',
    time: '3:00 PM - 6:00 PM',
    image: '/assets/generated/show-placeholder-1.dim_800x450.png',
  },
];
