import React from 'react';
import ReactDOM from 'react-dom';

const renderText  = (plainText) => {
        return plainText.map((text, index) => {
            const { ParsedText} = text;
            return (
                <p>
                    {ParsedText}
                </p>
            )
        })
};

const TextModal = ({ isShowing, hide, plainText, file }) => isShowing ? ReactDOM.createPortal(
    <React.Fragment>
        <div className="modal-overlay"/>
        <div className="modal-wrapper" aria-modal aria-hidden tabIndex={-1} role="dialog">
            <div className="modal">
                <div className="modal-header">
                    <h4 className={"text-modal-header"}>Converted plain-text for {file} file</h4>
                    <button type="button" className="modal-close-button" data-dismiss="modal" aria-label="Close" onClick={hide}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                {renderText(plainText)}
            </div>
        </div>
    </React.Fragment>, document.body
) : null;

export default TextModal;
