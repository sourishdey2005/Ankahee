import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { storyPrompts } from '@/lib/story-prompts'
import StoryClient from './StoryClient'
import { Tables } from '@/lib/supabase/types'

export const revalidate = 0

type StorySegment = Tables<'story_segments'>;

// Function to get the date in YYYY-MM-DD format for UTC
const getStoryId = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

const getDayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export default async function StoryPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const storyId = getStoryId()
  const dayOfYear = getDayOfYear(new Date());
  const dailyPrompt = storyPrompts[dayOfYear % storyPrompts.length];

  const { data: segments, error } = await supabase
    .from('story_segments')
    .select('*')
    .eq('story_id', storyId)
    .order('order', { ascending: true })

  if (error) {
    console.error('Error fetching story segments:', error)
  }

  const initialSegments: StorySegment[] = segments || [];

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="flex justify-between items-start mb-4">
        <Link href="/feed">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Feed
          </Button>
        </Link>
        <div className="text-right">
          <h1 className="text-2xl font-headline font-bold flex items-center gap-2">
            <BookOpen />
            Today's Story
          </h1>
          <p className="text-sm text-muted-foreground">One sentence at a time. A new story begins every day.</p>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <StoryClient
          user={session.user}
          storyId={storyId}
          prompt={dailyPrompt}
          initialSegments={initialSegments}
        />
      </div>
    </div>
  )
}
