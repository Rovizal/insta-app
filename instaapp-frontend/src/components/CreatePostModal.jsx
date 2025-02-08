import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const CreatePostModal = ({ handleAddPost, closeModal, isOpen }) => {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");

  // Tambahkan state untuk animasi modal
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowModal(true), 10); // Beri jeda agar animasi berjalan
    } else {
      setShowModal(false);
    }
  }, [isOpen]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setSelectedFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
      <div className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-all duration-300 ${isOpen ? "opacity-60" : "opacity-0"}`} onClick={closeModal}></div>

      <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-xl relative transform transition-all duration-300 ease-in-out ${showModal ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        <button onClick={closeModal} className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl">
          ✖
        </button>

        <h3 className="text-xl font-semibold mb-4">Create a Post</h3>
        <input type="file" id="fileUpload" name="image" accept="image/*" onChange={handleFileChange} className="hidden" />
        <label htmlFor="fileUpload" className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium block text-center">
          {selectedFile ? "Change Image" : "Upload Image"}
        </label>
        {preview && <img src={preview} alt="Preview" className="mt-4 w-full h-auto rounded-lg shadow-md" />}
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption..." className="w-full p-2 border rounded mt-3" required />
        <button type="button" onClick={() => handleAddPost(caption, selectedFile)} className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium mt-3">
          Post
        </button>
      </div>
    </div>
  );
};

CreatePostModal.propTypes = {
  handleAddPost: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default CreatePostModal;
