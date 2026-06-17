import React, { useState, Suspense, lazy } from "react";
import GenericModal from "../../Entrepreneurs/Components/GenericModal";
import "../Styles/SendCampaignButton.css";

const SendCampaignForm = lazy(() => import("./SendCampaignForm").then(m => ({ default: m.SendCampaignForm })));

export const SendCampaignButton: React.FC = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="send-campaign-button">
                <button
                    className="send-campaign-button__btn"
                    onClick={() => setShowModal(true)}
                >
                    Enviar Newsletter
                </button>
            </div>

            <GenericModal
                show={showModal}
                onClose={() => setShowModal(false)}
                title="Enviar Newsletter"
                size="xl"
                maxHeight
            >
                <Suspense fallback={<div>Cargando…</div>}>
                    <SendCampaignForm
                        onClose={() => setShowModal(false)}
                        onSuccess={() => setShowModal(false)}
                    />
                </Suspense>
            </GenericModal>
        </>
    );
};
