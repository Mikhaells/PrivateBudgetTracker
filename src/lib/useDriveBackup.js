import { useCallback, useEffect, useRef, useState } from 'react'
import { buildBackup, parseBackupText } from './backup'
import {
  clearDriveState,
  downloadBackupFile,
  findBackupFile,
  isDriveConfigured,
  loadDriveState,
  requestDriveToken,
  revokeDriveToken,
  saveDriveState,
  uploadBackupFile,
} from './drive'

const AUTO_SYNC_DELAY = 4000

function fingerprint(data) {
  return JSON.stringify(data)
}

export function useDriveBackup({ data, onRestore, notify }) {
  const configured = isDriveConfigured()
  const [saved] = useState(() => (typeof localStorage !== 'undefined' ? loadDriveState() : null))

  const [status, setStatus] = useState(() => {
    if (!configured) return 'unconfigured'
    return saved?.autoSync ? 'reconnecting' : 'idle'
  })
  const [remote, setRemote] = useState(() =>
    saved?.fileId ? { id: saved.fileId, modifiedTime: saved.remoteModifiedTime || null } : null
  )
  const [lastSync, setLastSync] = useState(saved?.lastSync || null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [autoSync, setAutoSync] = useState(Boolean(saved?.autoSync))

  const dataRef = useRef(data)
  const onRestoreRef = useRef(onRestore)
  const notifyRef = useRef(notify)
  const lastUploadedRef = useRef(null)
  const remoteRef = useRef(remote)
  const initializedRef = useRef(false)

  useEffect(() => {
    dataRef.current = data
  }, [data])

  useEffect(() => {
    onRestoreRef.current = onRestore
    notifyRef.current = notify
  })

  useEffect(() => {
    remoteRef.current = remote
  }, [remote])

  const uploadNow = useCallback(async ({ silent = false } = {}) => {
    const state = loadDriveState() || {}
    const payload = buildBackup(dataRef.current)

    let meta
    try {
      meta = await uploadBackupFile(payload, state.fileId)
    } catch (uploadError) {
      // File bisa saja dihapus dari Drive. Cari ulang, lalu buat baru bila perlu.
      if (uploadError.status === 404) {
        const existing = await findBackupFile()
        meta = await uploadBackupFile(payload, existing?.id)
      } else {
        throw uploadError
      }
    }

    const syncedAt = meta.modifiedTime || new Date().toISOString()
    saveDriveState({
      fileId: meta.id,
      remoteModifiedTime: meta.modifiedTime || syncedAt,
      lastSync: syncedAt,
      autoSync: true,
    })
    lastUploadedRef.current = fingerprint(dataRef.current)
    setRemote({ id: meta.id, name: meta.name, modifiedTime: meta.modifiedTime || syncedAt })
    setLastSync(syncedAt)
    setAutoSync(true)
    setStatus('connected')
    setError(null)

    if (!silent) {
      notifyRef.current?.(
        `Backup ke Google Drive selesai (${payload.counts.transactions} transaksi).`
      )
    }
    return meta
  }, [])

  const connect = useCallback(
    async ({ silent = false } = {}) => {
      if (!configured) {
        setStatus('unconfigured')
        return false
      }

      setBusy(true)
      setError(null)
      if (!silent) setStatus('connecting')

      try {
        await requestDriveToken({ prompt: silent ? 'none' : 'select_account' })
        const file = await findBackupFile()
        const state = loadDriveState() || {}

        if (!file) {
          await uploadNow({ silent: true })
          setStatus('connected')
          if (!silent) notifyRef.current?.('Google Drive terhubung. Backup otomatis aktif.')
          return true
        }

        saveDriveState({
          ...state,
          fileId: file.id,
          remoteModifiedTime: file.modifiedTime,
          autoSync: silent ? state.autoSync : false,
        })
        setRemote(file)

        if (!silent) {
          setStatus('needs-choice')
          return true
        }

        const remoteTime = Date.parse(file.modifiedTime || '') || 0
        const localSyncTime = Date.parse(state.lastSync || '') || 0
        if (remoteTime > localSyncTime + 1000) {
          // Drive berubah sejak sync terakhir (kemungkinan dari device lain).
          saveDriveState({ ...state, fileId: file.id, remoteModifiedTime: file.modifiedTime, autoSync: false })
          setAutoSync(false)
          setStatus('needs-choice')
        } else {
          setAutoSync(true)
          setStatus('connected')
        }
        return true
      } catch (connectError) {
        if (silent) {
          setStatus('idle')
        } else {
          setError(connectError.message)
          setStatus('error')
        }
        return false
      } finally {
        setBusy(false)
      }
    },
    [configured, uploadNow]
  )

  // Coba sambung ulang otomatis saat halaman dibuka (butuh sesi Google aktif).
  useEffect(() => {
    if (!configured || initializedRef.current) return
    initializedRef.current = true
    const state = loadDriveState()
    if (!state?.autoSync) return
    connect({ silent: true })
  }, [configured, connect])

  const keepLocal = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      await uploadNow()
      return true
    } catch (uploadError) {
      setError(uploadError.message)
      setStatus('error')
      return false
    } finally {
      setBusy(false)
    }
  }, [uploadNow])

  const restoreFromRemote = useCallback(
    async (file = remoteRef.current) => {
      if (!file?.id) return false
      setBusy(true)
      setError(null)
      try {
        const text = await downloadBackupFile(file.id)
        const parsed = parseBackupText(text, { sourceName: file.name || 'Google Drive' })
        if (!parsed.ok) throw new Error(parsed.error)

        await onRestoreRef.current?.(parsed)

        const syncedAt = file.modifiedTime || new Date().toISOString()
        saveDriveState({
          fileId: file.id,
          remoteModifiedTime: file.modifiedTime || syncedAt,
          lastSync: syncedAt,
          autoSync: true,
        })
        lastUploadedRef.current = fingerprint(parsed.backup.data)
        setRemote(file)
        setLastSync(syncedAt)
        setAutoSync(true)
        setStatus('connected')
        setError(null)
        return true
      } catch (restoreError) {
        setError(restoreError.message)
        setStatus('error')
        return false
      } finally {
        setBusy(false)
      }
    },
    []
  )

  const disconnect = useCallback(async ({ notify = true } = {}) => {
    setBusy(true)
    try {
      await revokeDriveToken()
    } catch {
      // Tetap putuskan koneksi lokal meskipun revoke gagal.
    }
    clearDriveState()
    setAutoSync(false)
    setRemote(null)
    setLastSync(null)
    setError(null)
    setStatus(configured ? 'idle' : 'unconfigured')
    setBusy(false)
    if (notify) notifyRef.current?.('Google Drive diputuskan. Backup otomatis dimatikan.')
  }, [configured])

  // Sinkron otomatis: unggah 4 detik setelah data berubah.
  useEffect(() => {
    if (!autoSync || status !== 'connected') return undefined
    if (fingerprint(data) === lastUploadedRef.current) return undefined

    const timer = setTimeout(() => {
      uploadNow({ silent: true }).catch((syncError) => {
        setError(syncError.message)
      })
    }, AUTO_SYNC_DELAY)

    return () => clearTimeout(timer)
  }, [autoSync, status, data, uploadNow])

  return {
    configured,
    status,
    busy,
    error,
    remote,
    lastSync,
    autoSync,
    connect,
    keepLocal,
    syncNow: keepLocal,
    restoreFromRemote,
    disconnect,
  }
}
