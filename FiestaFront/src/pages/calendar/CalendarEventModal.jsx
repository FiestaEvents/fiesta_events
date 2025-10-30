import React, { useState } from "react";
import Modal from "../../components/common/Modal.jsx";
import Button from "../../components/common/Button.jsx";

const CalendarEventModal = ({ isOpen, onClose, date, onSave }) => {
  const [title, setTitle] = useState("");

  const handleSave = () => {
    if (!title) return;
    onSave({ title, date });
    setTitle("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Event for ${date.toDateString()}`}
    >
      <div className="space-y-4">
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CalendarEventModal;
