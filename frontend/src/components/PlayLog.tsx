"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/useGame';

export function PlayLog() {
  const { gameState } = useGameStore();

  const formatAction = (action: any) => {
    const playerName = `Seat${action.seat}`;
    const street = action.street.charAt(0).toUpperCase() + action.street.slice(1);
    
    switch (action.type) {
      case 'f':
        return `${street}: ${playerName} folds`;
      case 'x':
        return `${street}: ${playerName} checks`;
      case 'c':
        return `${street}: ${playerName} calls ${action.amount}`;
      case 'b':
        return `${street}: ${playerName} bets ${action.amount}`;
      case 'r':
        return `${street}: ${playerName} raises to ${action.amount}`;
      case 'allin':
        return `${street}: ${playerName} goes all-in for ${action.amount}`;
      default:
        return `${street}: ${playerName} ${action.type}`;
    }
  };

  const formatBoard = () => {
    const { board } = gameState;
    let boardStr = '';
    
    if (board.flop) {
      boardStr += `Flop: ${board.flop}`;
    }
    if (board.turn) {
      boardStr += ` | Turn: ${board.turn}`;
    }
    if (board.river) {
      boardStr += ` | River: ${board.river}`;
    }
    
    return boardStr;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Play Log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="space-y-2 font-mono text-sm">
            {gameState.actions.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                No actions yet. Start a hand to begin playing.
              </div>
            ) : (
              <>
                {gameState.actions.map((action, index) => (
                  <div key={index} className="py-1">
                    {formatAction(action)}
                  </div>
                ))}
                
                {formatBoard() && (
                  <div className="py-2 border-t border-border mt-4">
                    <Badge variant="outline" className="font-mono">
                      {formatBoard()}
                    </Badge>
                  </div>
                )}
                
                <div className="py-2 border-t border-border mt-4">
                  <div className="text-muted-foreground">
                    Pot: {gameState.pot} | Street: {gameState.currentStreet}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
