import { CloudSun, Settings2, Share2 } from 'lucide-react';
import { IconButton } from '../ui/IconButton.jsx';
import { SearchBox } from '../search/SearchBox.jsx';

export function Header({ onOpenSettings, onShare, onLocate, locating, canShare, searchRef }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="glass flex size-10 items-center justify-center rounded-xl">
            <CloudSun className="size-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Weather</span>
        </div>
        <div className="flex gap-2 sm:hidden">
          {canShare && <IconButton label="Share this forecast" icon={Share2} onClick={onShare} />}
          <IconButton label="Settings" icon={Settings2} onClick={onOpenSettings} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <SearchBox onLocate={onLocate} locating={locating} inputRef={searchRef} />
      </div>

      <div className="hidden gap-2 sm:flex">
        {canShare && <IconButton label="Share this forecast" icon={Share2} onClick={onShare} />}
        <IconButton label="Settings" icon={Settings2} onClick={onOpenSettings} />
      </div>
    </header>
  );
}
