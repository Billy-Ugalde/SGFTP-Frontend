import React, { useState } from "react";
import { SendCampaignForm } from "./SendCampaignForm";
import GenericModal from "../../Fairs/Components/GenericModal";
import "../Styles/SendCampaignButton.css";
import { MailPlus } from "lucide-react"

export const SendCampaignButton: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="send-campaign-button">
                <button
                    className="primary-btn enhanced"
                    onClick={() => setShowModal(true)}
                >
                    <span className="button__icon"><MailPlus /></span>
                    <span>Enviar Newsletter</span>
                </button>
            </div>

            <GenericModal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="Enviar Newsletter"
                size="lg"
                maxHeight
            >
                <SendCampaignForm
                    onClose={() => setShowModal(false)}
                    onSuccess={() => setShowModal(false)}
                />
            </GenericModal>
        </>
    );
};
