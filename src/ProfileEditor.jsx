
import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './lib/supabase'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function ProfileEditor() {
  const [profile, setProfile] = useState({
    full_name: 'Elphaz Shelby',
    headline: 'Software Developer & Taifatech Founder',
    bio: '',
    photo_path: null,
    cv_path: null,
  })
  const [photoFile, setPhotoFile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [cvPickerStatus, setCvPickerStatus] = useState('Waiting for file selection.')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const galleryRef = useRef(null)
  const cameraRef = useRef(null)

  const photoPreview = useMemo(
    () => photoFile ? URL.createObjectURL(photoFile) : null,
    [photoFile],
  )

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  useEffect(() => {
    let active = true

    async function loadProfile() {
      const { data, error: loadError } = await supabase
        .from('portfolio_profile')
        .select('id, full_name, headline, bio, photo_path, cv_path')
        .eq('id', 1)
        .single()

      if (!active) return

      if (loadError) {
        setError('Could not load the saved profile. Check your Supabase table and read policy.')
      } else {
        setProfile(data)
      }

      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  function updateField(event) {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    if (!PHOTO_TYPES.includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP image.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('The profile photo must be 5 MB or smaller.')
      return
    }

    setError('')
    setMessage('')
    setPhotoFile(file)
  }

  function chooseCv(event) {
    setCvPickerStatus('File input change event received.')

    const input = event.currentTarget
    const file = input.files?.[0]

    setCvPickerStatus(
      file
        ? `File received: ${file.name} (${file.size} bytes)`
        : 'Change event received, but Android returned no file.'
    )

    setMessage(
      file
        ? `Picker returned: ${file.name} (${file.size} bytes)`
        : 'DIAGNOSTIC: Picker returned no file.'
    )

    console.info('[CV DEBUG] picker result', {
      hasFile: Boolean(file),
      fileName: file?.name ?? null,
      fileSize: file?.size ?? null,
      mimeType: file?.type ?? null,
      inputValuePresent: Boolean(input.value),
      page: window.location.pathname,
      time: new Date().toISOString(),
    })

    if (!file) {
      setCvFile(null)
      setError('No file was returned by the picker. Please try again.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setCvFile(null)
      setError('The CV must be 5 MB or smaller.')
      return
    }

    setError('')
    setMessage('')
    setCvFile(file)
  }

  async function saveProfile(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('portfolio_profile')
        .update({
          full_name: profile.full_name.trim(),
          headline: profile.headline.trim(),
          bio: profile.bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (updateError) throw updateError

      setProfile((current) => ({
        ...current,
        full_name: current.full_name.trim(),
        headline: current.headline.trim(),
        bio: current.bio.trim(),
      }))

      setMessage('Profile details saved.')
    } catch (saveError) {
      setError(saveError.message || 'Could not save profile details.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadPhoto() {
    if (!photoFile) {
      setError('Choose a photo before uploading.')
      return
    }

    setError('')
    setMessage('')
    setSaving(true)

    let uploadedPath = null

    try {
      const extension = photoFile.name.split('.').pop().toLowerCase()
      const path = `profile-photo-${Date.now()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(path, photoFile, {
          contentType: photoFile.type,
          upsert: false,
        })

      if (uploadError) throw uploadError
      uploadedPath = path

      const { error: updateError } = await supabase
        .from('portfolio_profile')
        .update({
          photo_path: path,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (updateError) throw updateError

      const oldPath = profile.photo_path
      setProfile((current) => ({ ...current, photo_path: path }))
      setPhotoFile(null)
      setMessage('Profile photo uploaded and saved.')

      if (oldPath && oldPath !== path) {
        const { error: cleanupError } = await supabase.storage
          .from('profile-photos')
          .remove([oldPath])

        if (cleanupError) {
          setMessage('Photo saved. The previous image could not be removed.')
        }
      }
    } catch (uploadError) {
      if (uploadedPath) {
        await supabase.storage.from('profile-photos').remove([uploadedPath])
      }

      setError(uploadError.message || 'Could not upload the profile photo.')
    } finally {
      setSaving(false)
    }
  }

  async function uploadCv() {
    if (!cvFile) {
      setError('Choose a PDF CV before uploading.')
      return
    }

    setError('')
    setMessage('')
    setSaving(true)

    let uploadedPath = null

    try {
      const signature = await cvFile.slice(0, 5).text()

      if (signature !== '%PDF-') {
        throw new Error('The selected file does not appear to be a valid PDF.')
      }

      const path = `cv-${Date.now()}.pdf`

      const { error: uploadError } = await supabase.storage
        .from('profile-cv')
        .upload(path, cvFile, {
          contentType: 'application/pdf',
          upsert: false,
        })

      if (uploadError) throw uploadError
      uploadedPath = path

      const { error: updateError } = await supabase
        .from('portfolio_profile')
        .update({
          cv_path: path,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1)

      if (updateError) throw updateError

      const oldPath = profile.cv_path
      setProfile((current) => ({ ...current, cv_path: path }))
      setCvFile(null)
      setMessage('CV uploaded and saved.')

      if (oldPath && oldPath !== path) {
        const { error: cleanupError } = await supabase.storage
          .from('profile-cv')
          .remove([oldPath])

        if (cleanupError) {
          setMessage('CV saved. The previous document could not be removed.')
        }
      }
    } catch (uploadError) {
      if (uploadedPath) {
        await supabase.storage.from('profile-cv').remove([uploadedPath])
      }

      setError(uploadError.message || 'Could not upload the CV.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p>Loading saved profile...</p>
  }

  const savedPhotoUrl = profile.photo_path
    ? supabase.storage.from('profile-photos').getPublicUrl(profile.photo_path).data.publicUrl
    : null

  const savedCvUrl = profile.cv_path
    ? supabase.storage.from('profile-cv').getPublicUrl(profile.cv_path).data.publicUrl
    : null

  return (
    <div className="profile-editor">
      <section className="editor-section">
        <h2>Profile details</h2>

        <form className="admin-form" onSubmit={saveProfile}>
          <label htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            name="full_name"
            value={profile.full_name}
            onChange={updateField}
            maxLength={100}
            required
          />

          <label htmlFor="profile-headline">Professional headline</label>
          <input
            id="profile-headline"
            name="headline"
            value={profile.headline}
            onChange={updateField}
            maxLength={160}
            required
          />

          <label htmlFor="profile-bio">About / biography</label>
          <textarea
            id="profile-bio"
            name="bio"
            value={profile.bio}
            onChange={updateField}
            rows={6}
            maxLength={3000}
            placeholder="Write the biography you want displayed on your portfolio."
          />

          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile details'}
          </button>
        </form>
      </section>

      <section className="editor-section">
        <h2>Profile photo</h2>
        <p>JPEG, PNG or WebP · Maximum 5 MB</p>

        {(photoPreview || savedPhotoUrl) && (
          <img
            className="profile-photo-preview"
            src={photoPreview || savedPhotoUrl}
            alt="Profile preview"
          />
        )}

        <input
          ref={galleryRef}
          className="visually-hidden-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={choosePhoto}
        />

        <input
          ref={cameraRef}
          className="visually-hidden-input"
          type="file"
          accept="image/*"
          capture="user"
          onChange={choosePhoto}
        />

        <div className="editor-actions">
          <button type="button" onClick={() => galleryRef.current?.click()}>
            Choose from gallery
          </button>
          <button type="button" onClick={() => cameraRef.current?.click()}>
            Take photo
          </button>
        </div>

        {photoFile && <p>Selected: {photoFile.name}</p>}

        <button type="button" onClick={uploadPhoto} disabled={saving || !photoFile}>
          {saving ? 'Uploading...' : 'Upload and save photo'}
        </button>
      </section>

      <section className="editor-section">
        <h2>Curriculum vitae</h2>
        <p>PDF only · Maximum 5 MB</p>

        {savedCvUrl && (
          <p>
            <a href={savedCvUrl} target="_blank" rel="noreferrer">
              View current CV
            </a>
          </p>
        )}

        <label htmlFor="cv-file-input">Select your CV PDF</label>
        <input
          id="cv-file-input"
          className="cv-file-input"
          type="file"
          accept=".pdf,application/pdf"
          onClick={() => {
            sessionStorage.setItem('cv-picker-started', new Date().toISOString())
            setCvPickerStatus('File input tapped; opening picker...')
          }}
          onChange={chooseCv}
        />

        <p role="status">{cvPickerStatus}</p>
        {cvFile && <p>Selected: {cvFile.name}</p>}

        <button type="button" onClick={uploadCv} disabled={saving || !cvFile}>
          {saving ? 'Uploading...' : 'Upload and save CV'}
        </button>
      </section>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {message && <p className="admin-message" role="status">{message}</p>}
    </div>
  )
}
