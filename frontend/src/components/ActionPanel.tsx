"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/useGame';
import { ActionType } from '@/lib/game/types';

export function ActionPanel() {
  const { gameState, betAmount, setBetAmount, makeAction, isStarted } = useGameStore();

  const currentPlayer = gameState.seats[gameState.currentPlayer];
  const legalActions = isStarted ? useGameStore.getState().engine.getLegalActions(gameState.currentPlayer) : [];

  const handleBetAmountChange = (value: string) => {
    const newValue = parseInt(value) || 0;
    setBetAmount(newValue);
  };

  const handleAmountStep = (delta: number) => {
    setBetAmount(betAmount + delta);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStarted && currentPlayer && (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Current Player: {currentPlayer.name} ({currentPlayer.role})
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Stack: {currentPlayer.stack} | Pot: {gameState.pot}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bet Amount</label>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAmountStep(-40)}
                  variant="outline"
                  size="sm"
                >
                  -40
                </Button>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => handleBetAmountChange(e.target.value)}
                  className="text-center"
                />
                <Button
                  onClick={() => handleAmountStep(40)}
                  variant="outline"
                  size="sm"
                >
                  +40
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => makeAction(ActionType.FOLD)}
                disabled={!legalActions.includes(ActionType.FOLD)}
                variant="destructive"
              >
                Fold
              </Button>
              <Button
                onClick={() => makeAction(ActionType.CHECK)}
                disabled={!legalActions.includes(ActionType.CHECK)}
                variant="outline"
              >
                Check
              </Button>
              <Button
                onClick={() => makeAction(ActionType.CALL)}
                disabled={!legalActions.includes(ActionType.CALL)}
                variant="secondary"
              >
                Call
              </Button>
              <Button
                onClick={() => makeAction(ActionType.BET)}
                disabled={!legalActions.includes(ActionType.BET)}
              >
                Bet
              </Button>
              <Button
                onClick={() => makeAction(ActionType.RAISE)}
                disabled={!legalActions.includes(ActionType.RAISE)}
                variant="outline"
              >
                Raise
              </Button>
              <Button
                onClick={() => makeAction(ActionType.ALL_IN)}
                disabled={!legalActions.includes(ActionType.ALL_IN)}
                variant="destructive"
              >
                All-in
              </Button>
            </div>
          </div>
        )}

        {!isStarted && (
          <div className="text-center text-muted-foreground">
            Start a hand to begin playing
          </div>
        )}

        {isStarted && gameState.isComplete && (
          <div className="text-center">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Hand Complete!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
