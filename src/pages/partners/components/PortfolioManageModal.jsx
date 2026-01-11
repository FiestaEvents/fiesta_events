import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/common/Modal";
import PortfolioTab from "./PortfolioTab";

const PortfolioManageModal = ({ isOpen, onClose, partner, onUpdate }) => {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("partners.portfolio.manageTitle", { name: partner?.name })}
      size="lg"
    >
      <div className="p-6">
        <PortfolioTab 
          partner={partner} 
          onUpdate={onUpdate}
        />
      </div>
    </Modal>
  );
};

export default PortfolioManageModal;