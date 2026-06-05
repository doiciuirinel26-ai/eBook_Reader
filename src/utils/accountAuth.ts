import { ReaderAccount } from '../types';

const ACCOUNTS_KEY = 'lectura_reader_accounts';
const SESSION_KEY = 'lectura_reader_session';

function loadAccounts(): ReaderAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: ReaderAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getReaderSession(): ReaderAccount | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setReaderSession(account: ReaderAccount | null) {
  if (account) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(account));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function registerReaderAccount(
  name: string,
  email: string,
  password: string
): { ok: true; account: ReaderAccount } | { ok: false; error: string } {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName || !trimmedEmail || !password) {
    return { ok: false, error: 'missing_fields' };
  }

  const accounts = loadAccounts();
  if (accounts.some(a => a.email === trimmedEmail)) {
    return { ok: false, error: 'email_exists' };
  }

  const account: ReaderAccount = {
    id: `reader-${Date.now()}`,
    name: trimmedName,
    email: trimmedEmail,
    password,
    joinedDate: new Date().toLocaleDateString('ro-RO'),
  };

  saveAccounts([...accounts, account]);
  setReaderSession(account);
  return { ok: true, account };
}

export function loginReaderAccount(
  email: string,
  password: string
): { ok: true; account: ReaderAccount } | { ok: false; error: string } {
  const trimmedEmail = email.trim().toLowerCase();
  const accounts = loadAccounts();

  if (accounts.length === 0) {
    return { ok: false, error: 'no_accounts' };
  }

  const match = accounts.find(a => a.email === trimmedEmail && a.password === password);
  if (!match) {
    return { ok: false, error: 'wrong_credentials' };
  }

  setReaderSession(match);
  return { ok: true, account: match };
}

export function logoutReaderAccount() {
  setReaderSession(null);
}
