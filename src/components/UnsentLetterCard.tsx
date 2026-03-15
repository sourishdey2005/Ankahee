import { Card, CardContent, CardFooter } from '@/components/ui/card'
import Countdown from './Countdown'
import { Clock } from 'lucide-react'
import Image from 'next/image'

export default function UnsentLetterCard({ letter }: { letter: any }) {
  const expiresAt = letter.expires_at || (letter._creationTime + (3 * 24 * 60 * 60 * 1000));

  return (
    <Card className="bg-card/50 backdrop-blur-sm overflow-hidden border-primary/10">
      {letter.imageUrl && (
        <div className="relative aspect-auto w-full max-h-[400px] overflow-hidden">
          <Image
            src={letter.imageUrl}
            alt="Letter memory"
            width={800}
            height={400}
            className="w-full object-contain bg-muted/20"
          />
        </div>
      )}
      <CardContent className="pt-6">
        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{letter.content}</p>
      </CardContent>
      <CardFooter className="flex justify-end items-center text-muted-foreground border-t border-primary/5 pt-4 pb-4">
          <div className="flex items-center space-x-2 text-xs">
            <Clock className="h-3 w-3" />
            <Countdown expiresAt={expiresAt.toString()} />
          </div>
      </CardFooter>
    </Card>
  )
}
