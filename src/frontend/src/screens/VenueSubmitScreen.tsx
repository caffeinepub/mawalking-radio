import { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useSubmitVenue, type VenueSubmission } from '@/hooks/useVenueQueries';

interface VenueSubmitScreenProps {
  onBack: () => void;
}

const VENUE_TYPES = [
  'Club',
  'Lounge',
  'Restaurant',
  'Bar',
  'Festival',
  'Event Space',
  'Other',
];

const AMENITIES = [
  'Dance Floor',
  'Live Music',
  'Family Friendly',
  'Kitchen',
  'Bar',
  'Outdoor Seating',
  'Parking',
];

export default function VenueSubmitScreen({ onBack }: VenueSubmitScreenProps) {
  const submitMutation = useSubmitVenue();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    street: '',
    city: '',
    state: '',
    country: 'USA',
    latitude: '',
    longitude: '',
    contactInfo: '',
    phoneNumber: '',
    website: '',
    hoursOfOperation: '',
    venueType: '',
    musicGenre: 'Rhumba',
    eventSchedule: '',
    coverCharge: '',
    photoUrl1: '',
    photoUrl2: '',
    photoUrl3: '',
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Business name is required';
    if (!formData.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact info is required';
    if (!formData.venueType) newErrors.venueType = 'Venue type is required';

    // Validate coordinates if provided
    if (formData.latitude && isNaN(parseFloat(formData.latitude))) {
      newErrors.latitude = 'Invalid latitude';
    }
    if (formData.longitude && isNaN(parseFloat(formData.longitude))) {
      newErrors.longitude = 'Invalid longitude';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const photoUrls = [formData.photoUrl1, formData.photoUrl2, formData.photoUrl3].filter(
      (url) => url.trim() !== ''
    );

    const submission: VenueSubmission = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      street: formData.street.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country,
      latitude: formData.latitude ? parseFloat(formData.latitude) : 0,
      longitude: formData.longitude ? parseFloat(formData.longitude) : 0,
      contactInfo: formData.contactInfo.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      website: formData.website.trim(),
      hoursOfOperation: formData.hoursOfOperation.trim(),
      venueType: formData.venueType,
      musicGenre: formData.musicGenre,
      amenities: selectedAmenities,
      photoUrls,
      eventSchedule: formData.eventSchedule.trim(),
      coverCharge: formData.coverCharge.trim(),
    };

    submitMutation.mutate(submission);
  };

  if (submitMutation.isSuccess) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
        <header className="w-full py-4 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Submit Venue</h1>
          </div>
        </header>
        <main className="px-4 sm:px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <Alert className="bg-white/10 border-white/20 backdrop-blur-md">
              <CheckCircle className="w-4 h-4 text-accent" />
              <AlertTitle className="text-white">Submission Successful!</AlertTitle>
              <AlertDescription className="text-white/80">
                Thank you for submitting your venue. Our team will review it and you'll be notified once it's approved.
              </AlertDescription>
            </Alert>
            <Button
              onClick={onBack}
              className="mt-4 w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden pb-fixed-bottom-ui">
      <header className="w-full py-4 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10 pt-safe">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Submit Venue</h1>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Venue Information</CardTitle>
              <CardDescription className="text-white/70">
                Submit your rhumba venue for approval. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Business Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">
                    Business Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Enter venue name"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-white/5 border-white/20 text-white min-h-[80px]"
                    placeholder="Describe your venue"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-white">
                    Street Address *
                  </Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="123 Main St"
                  />
                  {errors.street && (
                    <p className="text-destructive text-sm">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-destructive text-sm">{errors.city}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="text-destructive text-sm">{errors.state}</p>
                    )}
                  </div>
                </div>

                {/* Coordinates (Optional) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-white">
                      Latitude (Optional)
                    </Label>
                    <Input
                      id="latitude"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="40.7128"
                    />
                    {errors.latitude && (
                      <p className="text-destructive text-sm">{errors.latitude}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-white">
                      Longitude (Optional)
                    </Label>
                    <Input
                      id="longitude"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      className="bg-white/5 border-white/20 text-white"
                      placeholder="-74.0060"
                    />
                    {errors.longitude && (
                      <p className="text-destructive text-sm">{errors.longitude}</p>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <Label htmlFor="contactInfo" className="text-white">
                    Contact Info *
                  </Label>
                  <Input
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Email or contact person"
                  />
                  {errors.contactInfo && (
                    <p className="text-destructive text-sm">{errors.contactInfo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="https://example.com"
                  />
                </div>

                {/* Venue Type */}
                <div className="space-y-2">
                  <Label htmlFor="venueType" className="text-white">
                    Venue Type *
                  </Label>
                  <Select
                    value={formData.venueType}
                    onValueChange={(value) => handleInputChange('venueType', value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select venue type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VENUE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.venueType && (
                    <p className="text-destructive text-sm">{errors.venueType}</p>
                  )}
                </div>

                {/* Hours */}
                <div className="space-y-2">
                  <Label htmlFor="hoursOfOperation" className="text-white">
                    Hours of Operation
                  </Label>
                  <Textarea
                    id="hoursOfOperation"
                    value={formData.hoursOfOperation}
                    onChange={(e) => handleInputChange('hoursOfOperation', e.target.value)}
                    className="bg-white/5 border-white/20 text-white min-h-[60px]"
                    placeholder="Mon-Fri: 5pm-2am, Sat-Sun: 6pm-3am"
                  />
                </div>

                {/* Event Schedule */}
                <div className="space-y-2">
                  <Label htmlFor="eventSchedule" className="text-white">
                    Event Schedule
                  </Label>
                  <Textarea
                    id="eventSchedule"
                    value={formData.eventSchedule}
                    onChange={(e) => handleInputChange('eventSchedule', e.target.value)}
                    className="bg-white/5 border-white/20 text-white min-h-[60px]"
                    placeholder="Live rhumba every Friday and Saturday night"
                  />
                </div>

                {/* Cover Charge */}
                <div className="space-y-2">
                  <Label htmlFor="coverCharge" className="text-white">
                    Cover Charge
                  </Label>
                  <Input
                    id="coverCharge"
                    value={formData.coverCharge}
                    onChange={(e) => handleInputChange('coverCharge', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="$10 on weekends, Free on weekdays"
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                  <Label className="text-white">Amenities</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={() => handleAmenityToggle(amenity)}
                          className="border-white/20"
                        />
                        <Label
                          htmlFor={amenity}
                          className="text-white text-sm cursor-pointer"
                        >
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photo URLs */}
                <div className="space-y-2">
                  <Label className="text-white">Photos (URLs)</Label>
                  <Input
                    value={formData.photoUrl1}
                    onChange={(e) => handleInputChange('photoUrl1', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Photo URL 1"
                  />
                  <Input
                    value={formData.photoUrl2}
                    onChange={(e) => handleInputChange('photoUrl2', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Photo URL 2 (optional)"
                  />
                  <Input
                    value={formData.photoUrl3}
                    onChange={(e) => handleInputChange('photoUrl3', e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Photo URL 3 (optional)"
                  />
                </div>

                {/* Error Alert */}
                {submitMutation.isError && (
                  <Alert className="bg-destructive/10 border-destructive/20">
                    <AlertDescription className="text-white">
                      {submitMutation.error instanceof Error
                        ? submitMutation.error.message
                        : 'Failed to submit venue. Please try again.'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Venue'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
