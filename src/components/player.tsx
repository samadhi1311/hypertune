import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePlayback } from '@/hooks/use-playback';
import { DropletIcon, GaugeCircleIcon, PauseIcon, PlayIcon, RepeatIcon, ShuffleIcon, SkipBackIcon, SkipForwardIcon, Volume2Icon } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { formatTime } from '@/hooks/use-utilities';
import { Playlist } from '@/lib/types';
// import BackgroundEffect from './background-effect';
import { useEffect } from 'react';

function Player({ playlist, onTrackChange }: { playlist: Playlist; onTrackChange: (index: number) => void }) {
	const {
		currentIndex,
		isPlaying,
		isReady,
		currentTime,
		duration,
		containerRef,
		metadata,
		slowedEnabled,
		reverbEnabled,
		play,
		pause,
		handleNext,
		handlePrev,
		setVolume,
		toggleSlowed,
		toggleReverbed,
	} = usePlayback(playlist);

	useEffect(() => {
		onTrackChange(currentIndex);
	}, [currentIndex, onTrackChange]);

	// Current track or empty object if playlist is empty
	const currentTrack = playlist.tracks[currentIndex] || { url: '', name: '' };

	return (
		<div className='flex flex-row gap-4 items-center justify-around bg-sidebar/20 p-4 m-2 rounded-md border border-border inset-shadow-[0px_0px_32px] inset-shadow-border/50 backdrop-blur-xl'>
			{/* Album art and metadata */}
			<div className='size-24 aspect-square'>
				{metadata?.cover ? (
					<img src={metadata.cover} alt='Album art' className='size-24 object-cover rounded' />
				) : (
					<div className='size-24 text-muted-foreground rounded flex items-center justify-center'>
						<span className='text-3xl'>🎵</span>
					</div>
				)}
			</div>

			{/* <BackgroundEffect cover={metadata?.cover} /> */}

			<div className='flex flex-col justify-center min-w-md'>
				<h3 className='text-base font-medium line-clamp-2'>{metadata?.title || currentTrack.name || 'No track selected'}</h3>
				<p className='text-sm font-medium text-muted-foreground line-clamp-2'>{metadata?.artist || 'Unknown Artist'}</p>
				<p className='text-xs text-muted-foreground line-clamp-2'>{metadata?.album}</p>
			</div>
			<div className='flex flex-row gap-2 items-center'>
				<Button onClick={handlePrev} disabled={!currentTrack.url} className='rounded-full size-10' variant='ghost'>
					<SkipBackIcon />
				</Button>

				{isPlaying ? (
					<Button onClick={pause} disabled={!currentTrack.url} className='rounded-full size-12' variant='secondary'>
						<PauseIcon />
					</Button>
				) : (
					<Button onClick={play} disabled={!currentTrack.url || !isReady} className='rounded-full size-12' variant='secondary'>
						<PlayIcon />
					</Button>
				)}

				<Button onClick={handleNext} disabled={!currentTrack.url} className='rounded-full size-10' variant='ghost'>
					<SkipForwardIcon />
				</Button>
			</div>

			<div className='flex flex-row items-center gap-2 w-full'>
				<span className='text-sm w-16 text-center'>{formatTime(currentTime)}</span>
				<div ref={containerRef} className='w-full h-8' />
				<span className='text-sm w-16 text-center'>{formatTime(duration)}</span>
			</div>

			<div className='flex flex-row gap-2 max-w-32 w-full'>
				<Volume2Icon />
				<Slider defaultValue={[80]} min={0} max={100} step={1} onValueChange={(value) => setVolume(value[0] / 100)} />
			</div>

			<div className='flex flex-row gap-2'>
				<Button className='rounded-full size-10' variant='ghost'>
					<RepeatIcon />
				</Button>
				<Button className='rounded-full size-10' variant='ghost'>
					<ShuffleIcon />
				</Button>
				<Button className='rounded-full size-10' variant={slowedEnabled ? 'secondary' : 'ghost'} onClick={toggleSlowed}>
					<GaugeCircleIcon />
				</Button>
				<Button className='rounded-full size-10' variant={reverbEnabled ? 'secondary' : 'ghost'} onClick={toggleReverbed}>
					<DropletIcon />
				</Button>
				<ThemeToggle />
			</div>
		</div>
	);
}

export default Player;
