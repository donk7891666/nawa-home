export function createGameController({ chooseReaction, onStateChange, playReaction }) {
  let state = 'welcome';
  let reactionId = 0;

  const setState = (nextState) => {
    state = nextState;
    onStateChange(nextState);
  };

  return {
    get state() {
      return state;
    },
    enterGame() {
      setState('idle');
    },
    async touchFrog() {
      if (state === 'welcome') return;

      const currentReactionId = ++reactionId;
      setState('reacting');
      await playReaction(chooseReaction());
      if (currentReactionId === reactionId) {
        setState('idle');
      }
    },
  };
}
