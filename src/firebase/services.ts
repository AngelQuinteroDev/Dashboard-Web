
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  Timestamp,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { Session, SessionDocument, Highscore, HighscoreDocument } from '@/types';


const sessionsRef = collection(db, 'sessions');
const highscoresRef = collection(db, 'highscores');



function transformSession(doc: DocumentData, id: string): Session {
  const data = doc as SessionDocument;
  return {
    id,
    averageDecisionTime: data.averageDecisionTime ?? 0,
    collisions: data.collisions ?? 0,
    duration: data.duration ?? 0,
    finalScore: data.finalScore ?? 0,
    pathEfficiency: data.pathEfficiency ?? 0,
    pauseCount: data.pauseCount ?? 0,
    playerName: data.playerName ?? 'Unknown',
    reachedGoal: data.reachedGoal ?? false,
    remainingTime: data.remainingTime ?? 0,
    sessionId: data.sessionId ?? id,
    startTime: data.startTime instanceof Timestamp 
      ? data.startTime.toDate() 
      : new Date(data.startTime),
    wrongTurns: data.wrongTurns ?? 0,
  };
}

function transformHighscore(doc: DocumentData, id: string): Highscore {
  const data = doc as HighscoreDocument;
  return {
    id,
    playerName: data.playerName ?? id,
    score: data.score ?? 0,
  };
}



export function subscribeSessions(
  callback: (sessions: Session[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(sessionsRef, orderBy('startTime', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot: QuerySnapshot) => {
      const sessions = snapshot.docs.map((doc) =>
        transformSession(doc.data(), doc.id)
      );
      callback(sessions);
    },
    (error) => {
      console.error('Sessions listener error:', error);
      onError?.(error);
    }
  );
}

export function subscribeHighscores(
  callback: (highscores: Highscore[]) => void,
  onError?: (error: Error) => void
) {
  const q = query(highscoresRef, orderBy('score', 'desc'));

  return onSnapshot(
    q,
    (snapshot: QuerySnapshot) => {
      const highscores = snapshot.docs.map((doc, index) => ({
        ...transformHighscore(doc.data(), doc.id),
        rank: index + 1,
      }));
      callback(highscores);
    },
    (error) => {
      console.error('Highscores listener error:', error);
      onError?.(error);
    }
  );
}



export async function fetchSessions(): Promise<Session[]> {
  const q = query(sessionsRef, orderBy('startTime', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => transformSession(doc.data(), doc.id));
}

export async function fetchHighscores(): Promise<Highscore[]> {
  const q = query(highscoresRef, orderBy('score', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, index) => ({
    ...transformHighscore(doc.data(), doc.id),
    rank: index + 1,
  }));
}

export async function fetchTopHighscores(topN: number = 10): Promise<Highscore[]> {
  const q = query(highscoresRef, orderBy('score', 'desc'), limit(topN));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc, index) => ({
    ...transformHighscore(doc.data(), doc.id),
    rank: index + 1,
  }));
}
