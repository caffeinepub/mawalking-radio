import { useState } from 'react';
import { mockShows, type Show } from '@/data/mockShows';
import ShowCard from '@/components/shows/ShowCard';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BrowseShowsScreenProps {
  onShowSelect: (showId: string) => void;
}

export default function BrowseShowsScreen({ onShowSelect }: BrowseShowsScreenProps) {
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [dayFilter, setDayFilter] = useState<string>('all');

  const filteredShows = mockShows.filter(show => {
    if (genreFilter !== 'all' && !show.genres.includes(genreFilter)) {
      return false;
    }
    if (dayFilter !== 'all' && show.day !== dayFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Browse Shows
          </h1>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="flex-1 bg-white/10 text-white border-white/20">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                <SelectItem value="Rhumba">Rhumba</SelectItem>
                <SelectItem value="Soukous">Soukous</SelectItem>
                <SelectItem value="Ndombolo">Ndombolo</SelectItem>
                <SelectItem value="Afro Zouk">Afro Zouk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dayFilter} onValueChange={setDayFilter}>
              <SelectTrigger className="flex-1 bg-white/10 text-white border-white/20">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
                <SelectItem value="Saturday">Saturday</SelectItem>
                <SelectItem value="Sunday">Sunday</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Shows List */}
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredShows.length > 0 ? (
            filteredShows.map(show => (
              <ShowCard
                key={show.id}
                show={show}
                onClick={() => onShowSelect(show.id)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-white/60">No shows found matching your filters.</p>
              <Button
                onClick={() => {
                  setGenreFilter('all');
                  setDayFilter('all');
                }}
                variant="outline"
                className="mt-4 bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
