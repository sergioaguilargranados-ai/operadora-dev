"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUploadInput } from '@/components/admin/ImageUploadInput'
import { Check, Loader2, ExternalLink, Play } from 'lucide-react'

interface VideoUrlEditorProps {
    settingKey: string
    label: string
    onSave?: () => void
}

function formatYouTubeUrl(val: string) {
    if (!val) return val;
    try {
        if (val.includes('youtu.be/')) {
            const id = val.split('youtu.be/')[1]?.split('?')[0];
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
        if (val.includes('youtube.com/watch')) {
            const urlObj = new URL(val);
            const id = urlObj.searchParams.get('v');
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
        if (val.includes('youtube.com/shorts/')) {
            const id = val.split('youtube.com/shorts/')[1]?.split('?')[0];
            if (id) return `https://www.youtube.com/embed/${id}`;
        }
    } catch (e) {
        return val;
    }
    return val;
}

export function VideoUrlEditor({ settingKey, label, onSave }: VideoUrlEditorProps) {
    const [url, setUrl] = useState('')
    const [originalUrl, setOriginalUrl] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        loadSetting()
    }, [settingKey])

    const loadSetting = async () => {
        try {
            const res = await fetch(`/api/settings?key=${settingKey}`)
            const data = await res.json()
            if (data.success && data.value) {
                setUrl(data.value)
                setOriginalUrl(data.value)
            }
        } catch (error) {
            console.error('Error loading setting:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (url === originalUrl) return

        setSaving(true)
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: settingKey, value: url })
            })
            const data = await res.json()
            if (data.success) {
                setOriginalUrl(url)
                setSaved(true)
                setTimeout(() => setSaved(false), 2000)
                onSave?.()
            }
        } catch (error) {
            console.error('Error saving setting:', error)
        } finally {
            setSaving(false)
        }
    }

    const isYouTube = url.includes('youtube') || url.includes('youtu.be')
    const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')
    const hasChanges = url !== originalUrl

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <ImageUploadInput
                    value={url}
                    onChange={(val) => setUrl(formatYouTubeUrl(val))}
                    placeholder="https://www.youtube.com/embed/... o subir foto/video"
                    className="flex-1"
                />
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saving}
                    className={saved ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0066FF] hover:bg-[#0052CC]'}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        'Guardar'
                    )}
                </Button>
            </div>

            {/* Preview */}
            {url && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {isYouTube && <Play className="w-4 h-4 text-red-600" />}
                        <span>Vista previa:</span>
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                            Abrir <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>

                    {isYouTube ? (
                        <div className="aspect-video max-w-md rounded-lg overflow-hidden bg-gray-900">
                            <iframe
                                src={url}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : isVideo ? (
                        <video
                            src={url}
                            className="max-w-md rounded-lg"
                            controls
                            muted
                        />
                    ) : (
                        <img
                            src={url}
                            alt="Preview"
                            className="max-w-md rounded-lg max-h-40 object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                            }}
                        />
                    )}
                </div>
            )}

            {/* Tips */}
            <div className="text-xs text-muted-foreground">
                <p>💡 <strong>YouTube:</strong> Usa el formato embed: https://www.youtube.com/embed/VIDEO_ID</p>
                <p>💡 <strong>Imagen:</strong> Puedes usar URLs de Unsplash, Cloudinary, etc.</p>
            </div>
        </div>
    )
}
