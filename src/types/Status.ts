export type Status = 'loading' | 'needUpdate' | 'updated' | 'error' | 'none';
export type ServerStatus = {
  status: 'online' | 'offline' | 'pending';
  address: string;
  error?: string;
};
