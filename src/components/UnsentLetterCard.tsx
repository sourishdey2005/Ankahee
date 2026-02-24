import { Tables } from '@/lib/supabase/types'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import Countdown from './Countdown'
import { Clock } from 'lucide-react'

type Letter = Tables<'letters'>

export default function UnsentLetterCard({ letter }: { letter: Letter }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <p className="text-foreground/90 whitespace-pre-wrap">{letter.content}</p>
      </CardContent>
      <CardFooter className="flex justify-end items-center text-muted-foreground">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="h-4 w-4" />
            <Countdown expiresAt={letter.expires_at} />
          </div>
      </CardFooter>
    </Card>
  )
}
