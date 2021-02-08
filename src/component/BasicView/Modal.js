import React from 'react';
import ReactDOM from 'react-dom';

const renderText  = (plainText) => {
    if (plainText !== undefined) {
        return plainText.map((text, index) => {
            const { ParsedText} = text;
            return (
                <p key={index}>
                    {ParsedText}
                </p>
            )
        })
    }
};

const TextModal = ({ isShowing, hide, plainText, file, error }) => isShowing ? ReactDOM.createPortal(
    <React.Fragment>
        <div className="modal-overlay"/>
        <div className="modal-wrapper" aria-modal aria-hidden tabIndex={-1} role="dialog">
            <div className="modal">
                <div className="modal-header-close">
                    <h4 className="file-header">Converted plain-text for file: </h4>
                    <button type="button" className="modal-close-button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="file-title">
                    <h4>{file}</h4>
                </div>

                <div>
                    {renderText(plainText)}
                </div>

                <div>{error}</div>
            </div>
        </div>
    </React.Fragment>, document.body
) : null;

export default TextModal;
