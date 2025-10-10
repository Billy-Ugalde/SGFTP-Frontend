import React, { useState } from 'react';
import { useSendCampaign } from '../Services/NewsletterService';
import type { SendCampaignDto, CampaignLanguage } from '../types/newsletter.types';
import ConfirmationModal from './ConfirmationModal';
import '../Styles/SendCampaignForm.css';

interface SendCampaignFormProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const SendCampaignForm: React.FC<SendCampaignFormProps> = ({
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<SendCampaignDto>({
        subject: '',
        content: '',
        language: 'spanish' as CampaignLanguage,
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const sendCampaignMutation = useSendCampaign();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 👇 ya no hay modal aquí, solo el formulario
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
            <form onSubmit={handleSubmit} className="send-campaign-form">
            <div className="form__grid">
                <div className="form__field">
                    <label htmlFor="language" className="form__label">Idioma del Newsletter</label>
                    <select
                        id="language"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        className="form__input form__select"
                        required
                    >
                        <option value="spanish">Español</option>
                        <option value="english">English</option>
                    </select>
                </div>

                <div className="form__field">
                    <label htmlFor="subject" className="form__label">Asunto</label>
                    <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        className="form__input"
                        placeholder="Ingresa el asunto del newsletter"
                        maxLength={100}
                        required
                    />
                    <span className="form__sublabel">
                        Máximo 100 caracteres ({formData.subject.length}/100)
                    </span>
                </div>

                <div className="form__field form__field--full">
                    <label htmlFor="content" className="form__label">Contenido</label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="form__input form__textarea"
                        placeholder="Escribe el contenido del newsletter aquí..."
                        maxLength={2000}
                        required
                    />
                    <span className="form__sublabel">
                        Máximo 2000 caracteres ({formData.content.length}/2000)
                    </span>
                </div>
            </div>

            <div className="form__actions">
                <button
                    type="button"
                    className="cancel-btn"
                    onClick={onClose}
                    disabled={sendCampaignMutation.isPending}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="primary-btn enhanced"
                    disabled={sendCampaignMutation.isPending}
                >
                    {sendCampaignMutation.isPending ? 'Enviando...' : 'Enviar Newsletter'}
                </button>
            </div>
        </form>
        </>
    );
};
