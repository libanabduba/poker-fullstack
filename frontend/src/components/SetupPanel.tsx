"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/useGame';
import { ActionType } from '@/lib/game/types';

export function SetupPanel() {
  const { gameState, isStarted, startNewHand, resetHand, randomizeStacks } = useGameStore();

  const handleStackChange = (seat: number, value: string) => {
    const newValue = parseInt(value) || 0;
    if (newValue >= 0) {
      gameState.seats[seat].stack = newValue;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Game Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {gameState.seats.map((player, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{player.role}</Badge>
                <span className="text-sm font-medium">Seat {player.seat}</span>
              </div>
              <Input
                type="number"
                value={player.stack}
                onChange={(e) => handleStackChange(index, e.target.value)}
                disabled={isStarted}
                placeholder="Stack size"
              />
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={randomizeStacks}
            disabled={isStarted}
            variant="outline"
            className="flex-1"
          >
            Randomize Stacks
          </Button>
          {!isStarted ? (
            <Button onClick={startNewHand} className="flex-1">
              Start Hand
            </Button>
          ) : (
            <Button onClick={resetHand} variant="destructive" className="flex-1">
              Reset Hand
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
