import React from 'react';

export default function DeleteModal({ show, onClose, onConfirm }) {
    if (!show) return null;
 
    return (
        <div className="modal-overlay" style={overlayStyles}>
            <div className="modal-dialog" style={modalStyles}>
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Delete Post</h5>
                        <button 
                            type="button" 
                            className="close" 
                            onClick={onClose}
                            style={closeButtonStyle}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <p>Are you sure you want to delete this post?</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-danger" onClick={onConfirm}>Yes</button>
                        <button type="button" className="btn btn-secondary" onClick={onClose}>No</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(41, 34, 34, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const modalStyles = {
    backgroundColor: "black",
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '100%',
};

const closeButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    lineHeight: '1',
    cursor: 'pointer',
};