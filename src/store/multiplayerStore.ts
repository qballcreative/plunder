import { create } from 'zustand';
import Peer, { DataConnection } from 'peerjs';

export type MultiplayerState = 'idle' | 'hosting' | 'joining' | 'connected' | 'disconnected' | 'error';

interface GameMessage {
  type: 'game-state' | 'action' | 'chat' | 'ready' | 'start' | 'next-round';
  payload: unknown;
}

interface MultiplayerStore {
  state: MultiplayerState;
  peer: Peer | null;
  connection: DataConnection | null;
  peerId: string | null;
  hostId: string | null;
  isHost: boolean;
  opponentName: string | null;
  error: string | null;
  
  // Actions
  hostGame: (playerName: string) => Promise<string>;
  joinGame: (hostId: string, playerName: string) => Promise<void>;
  reconnect: (gameCode: string, playerName: string) => Promise<void>;
  sendMessage: (message: GameMessage) => void;
  disconnect: () => void;
  setOpponentName: (name: string) => void;
  onMessage: (callback: (message: GameMessage) => void) => () => void;
  reset: () => void;
}

const messageCallbacks: Set<(message: GameMessage) => void> = new Set();

const notifyListeners = (message: GameMessage) => {
  messageCallbacks.forEach((callback) => callback(message));
};

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  state: 'idle',
  peer: null,
  connection: null,
  peerId: null,
  hostId: null,
  isHost: false,
  opponentName: null,
  error: null,

  hostGame: async (playerName: string) => {
    return new Promise((resolve, reject) => {
      const peer = new Peer();
      
      peer.on('open', (id) => {
        set({ 
          peer, 
          peerId: id, 
          state: 'hosting', 
          isHost: true,
          error: null 
        });
        
        peer.on('connection', (conn) => {
          conn.on('open', () => {
            set({ connection: conn, state: 'connected' });
            // Send host name to guest
            conn.send({ type: 'chat', payload: { name: playerName } });
          });
          
          conn.on('data', (data) => {
            const message = data as GameMessage;
            if (message.type === 'chat' && (message.payload as { name?: string }).name) {
              set({ opponentName: (message.payload as { name: string }).name });
            }
            notifyListeners(message);
          });
          
          conn.on('close', () => {
            set({ state: 'disconnected', connection: null });
          });
          
          conn.on('error', (err) => {
            set({ error: err.message, state: 'error' });
          });
        });
        
        resolve(id);
      });
      
      peer.on('error', (err) => {
        set({ error: err.message, state: 'error' });
        reject(err);
      });
      
      peer.on('disconnected', () => {
        set({ state: 'disconnected' });
      });
    });
  },

  joinGame: async (hostId: string, playerName: string) => {
    return new Promise((resolve, reject) => {
      const peer = new Peer();
      
      peer.on('open', (id) => {
        set({ 
          peer, 
          peerId: id, 
          hostId, 
          state: 'joining', 
          isHost: false,
          error: null 
        });
        
        const conn = peer.connect(hostId, { reliable: true });
        
        conn.on('open', () => {
          set({ connection: conn, state: 'connected' });
          // Send guest name to host
          conn.send({ type: 'chat', payload: { name: playerName } });
          resolve();
        });
        
        conn.on('data', (data) => {
          const message = data as GameMessage;
          if (message.type === 'chat' && (message.payload as { name?: string }).name) {
            set({ opponentName: (message.payload as { name: string }).name });
          }
          notifyListeners(message);
        });
        
        conn.on('close', () => {
          set({ state: 'disconnected', connection: null });
        });
        
        conn.on('error', (err) => {
          set({ error: err.message, state: 'error' });
          reject(err);
        });
      });
      
      peer.on('error', (err) => {
        set({ error: err.message, state: 'error' });
        reject(err);
      });
      
      peer.on('disconnected', () => {
        set({ state: 'disconnected' });
      });
    });
  },

  reconnect: async (gameCode: string, playerName: string): Promise<void> => {
    const { peer, connection, isHost } = get();
    
    // Clean up existing connection
    connection?.close();
    peer?.destroy();
    
    // If host, re-host with same ID isn't possible with PeerJS, so just rejoin as guest
    // If guest, attempt to rejoin the host
    if (isHost) {
      // Host needs to create a new session - the guest will need to rejoin
      await get().hostGame(playerName);
      return;
    } else {
      return get().joinGame(gameCode, playerName);
    }
  },

  sendMessage: (message: GameMessage) => {
    const { connection } = get();
    if (connection) {
      connection.send(message);
    }
  },

  disconnect: () => {
    const { peer, connection } = get();
    connection?.close();
    peer?.destroy();
    set({
      state: 'idle',
      peer: null,
      connection: null,
      peerId: null,
      hostId: null,
      isHost: false,
      opponentName: null,
      error: null,
    });
  },

  setOpponentName: (name: string) => {
    set({ opponentName: name });
  },

  onMessage: (callback: (message: GameMessage) => void) => {
    messageCallbacks.add(callback);
    // Return unsubscribe function
    return () => {
      messageCallbacks.delete(callback);
    };
  },

  reset: () => {
    const { disconnect } = get();
    disconnect();
    messageCallbacks.clear();
  },
}));
