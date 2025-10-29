import { SetupPanel } from '@/components/SetupPanel';
import { ActionPanel } from '@/components/ActionPanel';
import { PlayLog } from '@/components/PlayLog';
import { HandHistory } from '@/components/HandHistory';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Poker Game</h1>
          <p className="text-muted-foreground">
            Fullstack Texas Hold&apos;em with FastAPI backend and Next.js frontend
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Play Log */}
          <div className="lg:col-span-1">
            <PlayLog />
          </div>

          {/* Center Panel - Setup and Actions */}
          <div className="lg:col-span-1 space-y-6">
            <SetupPanel />
            <ActionPanel />
          </div>

          {/* Right Panel - Hand History */}
          <div className="lg:col-span-1">
            <HandHistory />
          </div>
        </div>
      </div>
    </div>
  );
}
