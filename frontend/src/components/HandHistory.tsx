"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface HandHistoryItem {
  id: string;
  created_at: string;
  bb_size: number;
  short_line: string;
  result: Record<number, number>;
}

export function HandHistory() {
  const [hands, setHands] = useState<HandHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHands = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/hands?limit=20`);
      if (response.ok) {
        const data = await response.json();
        setHands(data);
      }
    } catch (error) {
      console.error('Failed to fetch hands:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHands();
  }, []);

  const formatWinnings = (result: Record<number, number>) => {
    const entries = Object.entries(result);
    return entries.map(([seat, amount]) => 
      `Seat${seat}: ${amount >= 0 ? '+' : ''}${amount}`
    ).join(', ');
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Hand History</CardTitle>
          <Button onClick={fetchHands} disabled={loading} size="sm">
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-4">
            {hands.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No hands found. Complete a hand to see history.
              </div>
            ) : (
              hands.map((hand) => (
                <div key={hand.id} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-xs">
                      {hand.id.slice(0, 8)}...
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      BB: {hand.bb_size}
                    </span>
                  </div>
                  
                  <div className="text-sm font-mono">
                    {hand.short_line}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {formatWinnings(hand.result)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(hand.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
