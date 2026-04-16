import React, { useState, useRef, useEffect } from 'react';
import { Mail, AlignLeft, Send } from 'lucide-react';
import { useSendCampaign } from '../Services/NewsletterService';
import type { SendCampaignDto, CampaignLanguage } from '../types/newsletter.types';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/SendCampaignForm.css';
import '../Styles/LanguageFilter.css';

const LANG_OPTIONS: { value: CampaignLanguage; label: string }[] = [
    { value: 'spanish', label: '🇪🇸 Español' },
    { value: 'english', label: '🇺🇸 English' },
];

interface SendCampaignFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const SendCampaignForm: React.FC<SendCampaignFormProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<SendCampaignDto>({
        subject: '',
        content: '',
        language: 'spanish' as CampaignLanguage,
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);

    const sendCampaignMutation = useSendCampaign();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (langRef.current && !langRef.current.contains(e.target as Node)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};
        if (!formData.subject.trim()) errors.subject = 'El asunto es obligatorio.';
        if (!formData.content.trim()) errors.content = 'El contenido es obligatorio.';
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
        setFieldErrors({});
        setShowConfirmModal(true);
    };

    const handleConfirmSend = async () => {
        try {
            await sendCampaignMutation.mutateAsync(formData);
            setShowConfirmModal(false);
            onSuccess();
        } catch (error) {
            console.error('Error sending campaign:', error);
            setShowConfirmModal(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }));
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const selectedLang = LANG_OPTIONS.find(o => o.value === formData.language);

    return (
        <>
            <ConfirmationModal
                show={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmSend}
                title="Confirmar envío de newsletter"
                message={`¿Estás seguro de que deseas enviar este newsletter a todos los suscriptores?\n\nAsunto: ${formData.subject}\nIdioma: ${formData.language === 'spanish' ? 'Español' : 'English'}`}
                confirmText="Enviar Newsletter"
                cancelText="Cancelar"
                type="info"
                isLoading={sendCampaignMutation.isPending}
            />

            <form onSubmit={handleSubmit} className="scf" noValidate>

                {/* Step Header */}
                <div className="scf__step-header">
                    <div className="scf__step-icon">
                        <Mail size={24} strokeWidth={2} />
                    </div>
                    <div className="scf__step-header-text">
                        <h3 className="scf__step-title">Redactar Newsletter</h3>
                        <p className="scf__step-description">
                            Completa el asunto y el contenido del newsletter. Se enviará a todos los suscriptores del idioma seleccionado.
                        </p>
                    </div>
                    <p className="scf__required-legend">
                        <span className="scf__required">*</span> Campo obligatorio
                    </p>
                </div>

                {/* Fields */}
                <div className="scf__fields">

                    {/* Language — custom dropdown */}
                    <div className="scf__field">
                        <label className="scf__label">
                            Idioma del Newsletter
                        </label>
                        <div className="lang-filter" ref={langRef}>
                            <button
                                type="button"
                                className="lang-filter__trigger"
                                onClick={() => setLangOpen(prev => !prev)}
                                disabled={sendCampaignMutation.isPending}
                            >
                                <span className="lang-filter__text">{selectedLang?.label}</span>
                                <span className={`lang-filter__chevron ${langOpen ? 'lang-filter__chevron--open' : ''}`}>
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>

                            {langOpen && (
                                <div className="lang-filter__dropdown">
                                    <div className="lang-filter__options">
                                        {LANG_OPTIONS.map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                className={`lang-filter__option ${formData.language === opt.value ? 'lang-filter__option--selected' : ''}`}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, language: opt.value }));
                                                    setLangOpen(false);
                                                }}
                                            >
                                                <span className="lang-filter__option-text">{opt.label}</span>
                                                {formData.language === opt.value && (
                                                    <span className="lang-filter__check">
                                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="scf__field">
                        <label htmlFor="subject" className="scf__label">
                            <AlignLeft size={14} strokeWidth={2} />
                            Asunto
                            <span className="scf__required">*</span>
                        </label>
                        <input
                            id="subject"
                            name="subject"
                            type="text"
                            value={formData.subject}
                            onChange={handleChange}
                            className={`scf__input${fieldErrors.subject ? ' scf__input--error' : ''}`}
                            placeholder="Ingresa el asunto del newsletter"
                            maxLength={100}
                            disabled={sendCampaignMutation.isPending}
                        />
                        {fieldErrors.subject && (
                            <span className="scf__error-text">{fieldErrors.subject}</span>
                        )}
                        <span className="scf__char-count">{formData.subject.length}/100</span>
                    </div>

                    {/* Content */}
                    <div className="scf__field scf__field--grow">
                        <label htmlFor="content" className="scf__label">
                            <AlignLeft size={14} strokeWidth={2} />
                            Contenido
                            <span className="scf__required">*</span>
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className={`scf__input scf__textarea${fieldErrors.content ? ' scf__input--error' : ''}`}
                            placeholder="Escribe el contenido del newsletter aquí..."
                            maxLength={2000}
                            disabled={sendCampaignMutation.isPending}
                        />
                        {fieldErrors.content && (
                            <span className="scf__error-text">{fieldErrors.content}</span>
                        )}
                        <span className="scf__char-count">{formData.content.length}/2000</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="scf__actions">
                    <button
                        type="button"
                        className="scf__cancel-btn"
                        onClick={onClose}
                        disabled={sendCampaignMutation.isPending}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="scf__submit-btn"
                        disabled={sendCampaignMutation.isPending}
                    >
                        {sendCampaignMutation.isPending ? (
                            <>
                                <svg className="scf__spinner" fill="none" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="8" />
                                </svg>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send size={16} strokeWidth={2} />
                                Enviar Newsletter
                            </>
                        )}
                    </button>
                </div>
            </form>
        </>
    );
};
