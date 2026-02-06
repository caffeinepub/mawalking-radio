import { Mail, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PushNotificationsPanel } from '@/components/PushNotificationsPanel';

export default function SettingsAboutScreen() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Settings & About
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Notifications */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Notifications</CardTitle>
              <CardDescription className="text-white/60">
                Manage push notifications for track changes and live shows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PushNotificationsPanel />
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">About Mawalking Radio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-white/80 leading-relaxed">
                Mawalking Radio is dedicated to showcasing the vibrant sounds of African music to a global audience. 
                We broadcast live Congolese Rhumba, Soukous, Ndombolo, and Afro Zouk 24/7, celebrating the rich 
                musical heritage of Africa and bringing it to listeners worldwide.
              </p>
              <p className="text-white/80 leading-relaxed">
                Our mission is to preserve and promote African rhythms, connecting communities through the universal 
                language of music. From classic Rhumba legends to contemporary Ndombolo hits, we're your home for 
                authentic African sounds.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
                asChild
              >
                <a href="https://www.mawalkingradio.app" target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4 mr-2" />
                  Visit Our Website
                </a>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-white/20 touch-manipulation"
                asChild
              >
                <a href="mailto:info@mawalkingradio.app">
                  <Mail className="w-4 h-4 mr-2" />
                  info@mawalkingradio.app
                </a>
              </Button>
            </CardContent>
          </Card>

          <Separator className="bg-white/10" />

          {/* Footer */}
          <div className="text-center py-4">
            <p className="text-sm text-white/60">
              © 2026. Built with love using{' '}
              <a 
                href="https://caffeine.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
