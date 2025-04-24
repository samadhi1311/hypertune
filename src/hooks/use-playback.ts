import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Playlist, TrackMetadata } from '@/lib/types';
import { extractMetadata } from './use-utilities';
import { useTheme } from '@/components/theme-provider';

export const usePlayback = (playlist: Playlist) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [metadata, setMetadata] = useState<TrackMetadata | null>(null);
	const [slowedEnabled, setSlowedEnabled] = useState(() => {
		const savedSlowed = localStorage.getItem('hypertune-slowed');
		return savedSlowed ? JSON.parse(savedSlowed) : false;
	});

	// Initialize reverbEnabled from localStorage or default to false
	const [reverbEnabled, setReverbEnabled] = useState(() => {
		const savedReverb = localStorage.getItem('hypertune-reverb');
		return savedReverb ? JSON.parse(savedReverb) : false;
	});
	const audioContextRef = useRef<AudioContext | null>(null);
	const reverbNodeRef = useRef<ConvolverNode | null>(null);
	const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);
	const dryGainNodeRef = useRef<GainNode | null>(null);
	const wetGainNodeRef = useRef<GainNode | null>(null);
	const filterNodeRef = useRef<BiquadFilterNode | null>(null);

	// Function to create reverb impulse response
	const createImpulseResponse = (audioContext: AudioContext, duration: number = 3, decay: number = 2) => {
		const sampleRate = audioContext.sampleRate;
		const length = sampleRate * duration;
		const impulse = audioContext.createBuffer(2, length, sampleRate);

		for (let channel = 0; channel < 2; channel++) {
			const channelData = impulse.getChannelData(channel);
			for (let i = 0; i < length; i++) {
				channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
			}
		}

		return impulse;
	};

	const wavesurferRef = useRef<WaveSurfer | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const { theme } = useTheme();

	// Extract metadata when track changes
	useEffect(() => {
		if (playlist.tracks.length === 0 || currentIndex >= playlist.tracks.length) return;

		const getMetadata = async () => {
			const data = await extractMetadata(playlist.tracks[currentIndex].url);
			setMetadata(data);
		};

		getMetadata();
	}, [currentIndex, playlist]);

	// Update current time when playback speed changes
	useEffect(() => {
		if (!wavesurferRef.current) return;
		if (slowedEnabled) {
			wavesurferRef.current.setPlaybackRate(0.9);
		} else {
			wavesurferRef.current.setPlaybackRate(1);
		}
	}, [slowedEnabled]);

	// Effect to set up audio nodes when WaveSurfer is ready
	useEffect(() => {
		if (!wavesurferRef.current) return;

		const mediaElement = wavesurferRef.current.getMediaElement();
		if (!mediaElement) return;

		// Only create audio context and nodes if they don't exist yet
		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContext();
			sourceNodeRef.current = audioContextRef.current.createMediaElementSource(mediaElement);
			gainNodeRef.current = audioContextRef.current.createGain();
			dryGainNodeRef.current = audioContextRef.current.createGain();
			wetGainNodeRef.current = audioContextRef.current.createGain();
			filterNodeRef.current = audioContextRef.current.createBiquadFilter();
			reverbNodeRef.current = audioContextRef.current.createConvolver();

			// Set fixed dry/wet mix
			dryGainNodeRef.current.gain.value = 1;
			wetGainNodeRef.current.gain.value = 1.25;

			// Configure filter
			filterNodeRef.current.type = 'bandpass';
			filterNodeRef.current.frequency.value = Math.sqrt(200 * 5000);
			filterNodeRef.current.Q.value = 1;

			// Create and set impulse response
			const impulse = createImpulseResponse(audioContextRef.current);
			if (reverbNodeRef.current) {
				reverbNodeRef.current.buffer = impulse;
			}
		}

		// Apply the current reverb setting by reconfiguring connections
		if (sourceNodeRef.current && gainNodeRef.current && reverbNodeRef.current && dryGainNodeRef.current && wetGainNodeRef.current && filterNodeRef.current) {
			// Disconnect all existing connections first
			sourceNodeRef.current.disconnect();
			gainNodeRef.current.disconnect();
			reverbNodeRef.current.disconnect();
			dryGainNodeRef.current.disconnect();
			wetGainNodeRef.current.disconnect();
			filterNodeRef.current.disconnect();

			if (reverbEnabled) {
				// Dry path (direct)
				sourceNodeRef.current.connect(dryGainNodeRef.current);
				dryGainNodeRef.current.connect(gainNodeRef.current);

				// Wet path (with filter and reverb)
				sourceNodeRef.current.connect(filterNodeRef.current);
				filterNodeRef.current.connect(reverbNodeRef.current);
				reverbNodeRef.current.connect(wetGainNodeRef.current);
				wetGainNodeRef.current.connect(gainNodeRef.current);

				// Final output
				gainNodeRef.current.connect(audioContextRef.current.destination);
			} else {
				// Connect without reverb
				sourceNodeRef.current.connect(gainNodeRef.current);
				gainNodeRef.current.connect(audioContextRef.current.destination);
			}
		}

		// Save reverb state to localStorage whenever it changes
		localStorage.setItem('hypertune-reverb', JSON.stringify(reverbEnabled));

		return () => {
			// Only close the audio context when the component unmounts
			if (wavesurferRef.current === null) {
				audioContextRef.current?.close();
				audioContextRef.current = null;
			}
		};
	}, [wavesurferRef.current, reverbEnabled]);

	// Load and set up WaveSurfer when current track changes
	useEffect(() => {
		if (playlist.tracks.length === 0 || !containerRef.current) return;

		// Check if currentIndex is valid
		if (currentIndex >= playlist.tracks.length) {
			// Reset to a valid index
			setCurrentIndex(0);
			return;
		}

		// Ensure the track at currentIndex exists and has a url
		if (!playlist.tracks[currentIndex] || !playlist.tracks[currentIndex].url) {
			console.error('Invalid track or missing URL at index:', currentIndex);
			return;
		}

		// Clean up previous instance
		if (wavesurferRef.current) {
			wavesurferRef.current.destroy();
		}

		// Reset audio nodes when changing tracks
		if (audioContextRef.current) {
			// Disconnect all nodes
			sourceNodeRef.current?.disconnect();
			gainNodeRef.current?.disconnect();
			reverbNodeRef.current?.disconnect();
			dryGainNodeRef.current?.disconnect();
			wetGainNodeRef.current?.disconnect();
			filterNodeRef.current?.disconnect();

			// Close the audio context
			audioContextRef.current.close();

			// Reset all refs
			audioContextRef.current = null;
			sourceNodeRef.current = null;
			gainNodeRef.current = null;
			reverbNodeRef.current = null;
			dryGainNodeRef.current = null;
			wetGainNodeRef.current = null;
			filterNodeRef.current = null;
		}

		setIsReady(false);

		// Create new WaveSurfer instance
		wavesurferRef.current = WaveSurfer.create({
			container: containerRef.current,
			waveColor: theme === 'dark' ? '#454545' : '#959595',
			progressColor: theme === 'dark' ? '#959595' : '#454545',
			cursorWidth: 0,
			barWidth: 2,
			height: 32,
			autoScroll: true,
			autoCenter: true,
			autoplay: false,
			dragToSeek: true,
			interact: true,
			barRadius: 64,
			barAlign: 'bottom',
			barGap: 1,
			hideScrollbar: true,
			normalize: true,
			fillParent: true,
			audioRate: slowedEnabled ? 0.9 : 1,
		});

		// Load audio file - with additional safety check
		const trackUrl = playlist.tracks[currentIndex]?.url;
		if (trackUrl) {
			wavesurferRef.current.load(trackUrl);
		} else {
			console.error('Track URL is undefined at index:', currentIndex);
		}

		// Event listeners
		wavesurferRef.current.on('ready', () => {
			setIsReady(true);
			setDuration(wavesurferRef.current?.getDuration() || 0);
			if (slowedEnabled) {
				wavesurferRef.current?.setPlaybackRate(0.9, false);
			} else {
				wavesurferRef.current?.setPlaybackRate(1, false);
			}

			// Manually start playback after setting the rate
			wavesurferRef.current?.play();
		});

		wavesurferRef.current.on('play', () => {
			setIsPlaying(true);
		});

		wavesurferRef.current.on('pause', () => {
			setIsPlaying(false);
		});

		wavesurferRef.current.on('finish', () => {
			setIsPlaying(false);
			handleNext();
		});

		wavesurferRef.current.on('audioprocess', () => {
			setCurrentTime(wavesurferRef.current?.getCurrentTime() || 0);
		});

		wavesurferRef.current.on('seeking', () => {
			setCurrentTime(wavesurferRef.current?.getCurrentTime() || 0);
		});

		return () => {
			wavesurferRef.current?.destroy();
		};
	}, [currentIndex, playlist, slowedEnabled]);

	const play = () => {
		if (!wavesurferRef.current) return;
		wavesurferRef.current.play();
	};

	const pause = () => {
		wavesurferRef.current?.pause();
	};

	const stop = () => {
		wavesurferRef.current?.stop();
		setCurrentTime(0);
	};

	const handleNext = () => {
		if (playlist.tracks.length === 0) return;
		stop();
		// Add safety check to ensure we don't exceed array bounds
		const nextIndex = (currentIndex + 1) % Math.max(1, playlist.tracks.length);
		setCurrentIndex(nextIndex);
	};

	const handlePrev = () => {
		if (playlist.tracks.length === 0) return;
		stop();
		// Add safety check to ensure we don't exceed array bounds
		const prevIndex = (currentIndex - 1 + playlist.tracks.length) % Math.max(1, playlist.tracks.length);
		setCurrentIndex(prevIndex);
	};

	const seek = (value: number) => {
		if (!wavesurferRef.current || duration === 0) return;
		wavesurferRef.current.seekTo(value / duration);
		setCurrentTime(value);
	};

	const setVolume = (value: number) => {
		wavesurferRef.current?.setVolume(value);
	};

	const toggleSlowed = () => {
		setSlowedEnabled((prev: boolean) => {
			const newValue = !prev;
			// Save to localStorage inside the state updater function
			localStorage.setItem('hypertune-slowed', JSON.stringify(newValue));
			return newValue;
		});
	};

	const toggleReverbed = () => {
		setReverbEnabled((prev: boolean) => {
			const newValue = !prev;
			localStorage.setItem('hypertune-reverb', JSON.stringify(newValue));
			return newValue;
		});
	};

	return {
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
		stop,
		handleNext,
		handlePrev,
		seek,
		setVolume,
		toggleSlowed,
		toggleReverbed,
	};
};
