const UndercoverGame = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation */}
      <div className="h-11 border-b border-border flex items-center px-4 gap-1 shrink-0 bg-card/30">
        <button className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium">
          大厅
        </button>
        <button className="px-4 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          游戏介绍
        </button>
      </div>

      {/* Placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🕵️</span>
          <h2 className="display-title text-3xl text-foreground mb-2">谁是卧底</h2>
          <p className="text-muted-foreground text-sm">即将推出，敬请期待...</p>
        </div>
      </div>
    </div>
  );
};

export default UndercoverGame;
