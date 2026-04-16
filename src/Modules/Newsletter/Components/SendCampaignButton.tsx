import React, { useState } from "react";
import { SendCampaignForm } from "./SendCampaignForm";
import GenericModal from "../../Entrepreneurs/Components/GenericModal";
import "../Styles/SendCampaignButton.css";
import { MailPlus } from "lucide-react"

export const SendCampaignButton: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="send-campaign-button">
                <button
                    className="send-campaign-button__btn"
                    onClick={() => setShowModal(true)}
                >
                    <MailPlus size={18} strokeWidth={2} />
                    <span>Enviar Newsletter</span>
                </button>
            </div>

            <GenericModal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="Enviar Newsletter"
                size="xl"
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
