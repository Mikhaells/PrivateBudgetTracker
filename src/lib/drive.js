// Integrasi Google Drive (opsional) untuk backup otomatis.
//
// File disimpan di `appDataFolder` — folder tersembunyi milik aplikasi.
// Scope `drive.appdata` hanya memberi akses ke folder data aplikasi ini,
// sehingga aplikasi tidak bisa membaca file lain di Drive pengguna.

const ENV = import.meta.env || {}
const CLIENT_ID = String(ENV.VITE_GOOGLE_CLIENT_ID || '').trim()

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const GIS_SRC = 'https://accounts.google.com/gsi/client'
const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const STATE_KEY = 'budget-tracker.drive.v1'

export const DRIVE_FILE_NAME = 'budget-tracker-backup.json'

let accessToken = null
let tokenExpiresAt = 0
let gisPromise = null

export function isDriveConfigured() {
  return CLIENT_ID.length > 0
}

export function loadDriveState() {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveDriveState(state) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  } catch {
    // Abaikan: status Drive bukan data utama, tidak perlu menghentikan aplikasi.
  }
}

export function clearDriveState() {
  try {
    localStorage.removeItem(STATE_KEY)
  } catch {
    // noop
  }
}

function loadGis() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Google Drive hanya tersedia di browser.'))
  if (window.google?.accounts?.oauth2) return Promise.resolve()
  if (gisPromise) return gisPromise

  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => {
      gisPromise = null
      reject(new Error('Gagal memuat Google Identity Services. Periksa koneksi internet.'))
    }
    document.head.appendChild(script)
  })
  return gisPromise
}

function friendlyTokenError(error) {
  if (error === 'access_denied') return 'Izin Google Drive ditolak.'
  if (error === 'interaction_required' || error === 'login_required') {
    return 'Sesi Google sudah berakhir. Hubungkan ulang Google Drive.'
  }
  if (error === 'popup_closed') return 'Jendela login Google ditutup sebelum selesai.'
  return error || 'Gagal terhubung ke Google Drive.'
}

export async function requestDriveToken({ prompt = 'select_account' } = {}) {
  if (!isDriveConfigured()) {
    throw new Error('Google Drive belum disiapkan. Isi VITE_GOOGLE_CLIENT_ID terlebih dahulu.')
  }
  await loadGis()

  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject(new Error('Waktu koneksi Google habis. Coba lagi.'))
    }, 120000)
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      fn(value)
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response?.error) {
          finish(reject, new Error(friendlyTokenError(response.error_description || response.error)))
          return
        }
        accessToken = response.access_token
        const expiresIn = Number(response.expires_in) || 3600
        tokenExpiresAt = Date.now() + Math.max(60, expiresIn - 120) * 1000
        finish(resolve, accessToken)
      },
      error_callback: (error) => {
        finish(reject, new Error(friendlyTokenError(error?.message || error?.type)))
      },
    })

    try {
      client.requestAccessToken({ prompt })
    } catch (error) {
      finish(reject, error)
    }
  })
}

async function ensureDriveToken() {
  if (accessToken && Date.now() < tokenExpiresAt) return accessToken
  return requestDriveToken({ prompt: 'none' })
}

export function hasDriveToken() {
  return Boolean(accessToken && Date.now() < tokenExpiresAt)
}

export async function revokeDriveToken() {
  const current = accessToken
  accessToken = null
  tokenExpiresAt = 0
  if (!current || typeof window === 'undefined' || !window.google?.accounts?.oauth2) return
  await Promise.race([
    new Promise((resolve) => {
      try {
        window.google.accounts.oauth2.revoke(current, () => resolve())
      } catch {
        resolve()
      }
    }),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ])
}

async function driveRequest(url, options = {}, retry = true) {
  const token = await ensureDriveToken()
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })

  if (response.status === 401 && retry) {
    accessToken = null
    tokenExpiresAt = 0
    return driveRequest(url, options, false)
  }

  if (!response.ok) {
    let message = `Google Drive menolak permintaan (${response.status}).`
    try {
      const body = await response.json()
      if (body?.error?.message) message = body.error.message
    } catch {
      // biarkan pesan default
    }
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return response
}

export async function findBackupFile() {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`)
  const url = `${API_BASE}/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`
  const response = await driveRequest(url)
  const body = await response.json()
  return body.files?.[0] || null
}

export async function downloadBackupFile(fileId) {
  const response = await driveRequest(`${API_BASE}/files/${encodeURIComponent(fileId)}?alt=media`)
  return response.text()
}

export async function uploadBackupFile(payload, fileId) {
  let id = fileId

  if (!id) {
    const created = await driveRequest(`${API_BASE}/files?fields=id,name,modifiedTime`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: DRIVE_FILE_NAME, parents: ['appDataFolder'] }),
    })
    const meta = await created.json()
    id = meta.id
  }

  const response = await driveRequest(
    `${UPLOAD_BASE}/files/${encodeURIComponent(id)}?uploadType=media&fields=id,name,modifiedTime`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload, null, 2),
    }
  )
  return response.json()
}
