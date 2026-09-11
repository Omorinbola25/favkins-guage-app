import { firestoreAudioStore } from './firestore-audio-store';
import type { AudioStore } from './audio-store';

export const recordingStore: AudioStore = firestoreAudioStore;
