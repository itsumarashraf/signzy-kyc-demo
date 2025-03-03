import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { faceMatch, uploadKycData } from './api';

const KYCForm = ({ kycType, resetKycType }) => {
    const [frontDocumentFile, setFrontDocumentFile] = useState(null);
    const [backDocumentFile, setBackDocumentFile] = useState(null);
    const [selfieFile, setSelfieFile] = useState(null);  // For uploaded file
    const [selfieBlob, setSelfieBlob] = useState(null);  // For captured selfie (webcam)
    const [kycExtractionData, setKycExtractionData] = useState(null);  // For captured selfie (webcam)

    const [selfieOption, setSelfieOption] = useState('');  // 'webcam' or 'upload'
    const [selfieCaptured, setSelfieCaptured] = useState(false);  // To track if selfie is ready

    const [isDocumentsSubmitted, setIsDocumentsSubmitted] = useState(false);  // To track if front and back docs are submitted

    const [dialogOpen, setDialogOpen] = useState(false);  // Dialog visibility state
    const [dialogContent, setDialogContent] = useState(null);  // Store content for the dialog

    const [isUploading, setIsUploading] = useState(false);  // Loading state for uploads

    const webcamRef = useRef(null);

    // Handle front and back document uploads
    const handleFrontDocumentChange = (e) => {
        setFrontDocumentFile(e.target.files[0]);
    };

    const handleBackDocumentChange = (e) => {
        setBackDocumentFile(e.target.files[0]);
    };

    // Webcam capture for selfie
    const handleSelfieCapture = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                setSelfieBlob(blob);
                setSelfieCaptured(true);
            });
    };

    // Handle manual selfie upload
    const handleSelfieFileChange = (e) => {
        setSelfieFile(e.target.files[0]);
        setSelfieCaptured(true);
    };

    // Submit the front and back documents
    const handleSubmitDocuments = async () => {
        if (!frontDocumentFile || !backDocumentFile) {
            alert('Please upload both front and back of the Aadhaar card.');
            return;
        }

        setIsUploading(true);  // Set loading to true when uploading

        const formData = new FormData();
        formData.append('kycType', kycType);
        formData.append('frontDocument', frontDocumentFile);
        formData.append('backDocument', backDocumentFile);

        try {
            const response = await uploadKycData(kycType, formData);
            if(response?.error){
                alert('Something is wong with your adhaar')
                resetKycType();
                return
            }
            setIsUploading(false);  // Set loading to false when upload is done

            setKycExtractionData(response);

            // Set dialog content with KYC data and open the dialog after uploading
            setDialogContent({
                uploadKycDataResult: response,
            });
            setDialogOpen(true);  // Open the dialog to show results

            setIsDocumentsSubmitted(true);  // After submission, show selfie options
        } catch (error) {
            setIsUploading(false);
            alert('Failed to upload KYC data');
            console.error(error);
        }
    };

    // Submit the selfie
    const handleSubmitSelfie = async () => {
        if (!selfieFile && !selfieBlob) {
            alert('Please upload or capture a selfie.');
            return;
        }

        setIsUploading(true);  // Set loading to true while uploading selfie

        const formData = new FormData();
        formData.append('selfie', selfieBlob || selfieFile);
        formData.append('adhaarFrontImageLink', kycExtractionData.files[0]);

        try {
            const response = await faceMatch(formData);  // You might need a different API endpoint for the selfie submission
            setIsUploading(false);  // Set loading to false when upload is done

            // Set dialog content with the face match result and open the dialog
            setDialogContent({
                faceMatchResult: response.result,
            });
            setDialogOpen(true);  // Open the dialog to show the face match result

            // resetKycType();  // Reset KYC type after successful verification
        } catch (error) {
            setIsUploading(false);
            alert('Failed to upload Selfie');
            console.error(error);
        }
    };

    // Close the dialog
    const closeDialog = () => {
        setDialogOpen(false);
    };

    return (
        <div style={{ marginTop: '20px' }}>
            <h3>{kycType === 'aadhaar' ? 'Aadhaar Verification' : 'PAN Card Verification'}</h3>
            {kycType === 'aadhaar' && <strong>
                Here I'm using the Aadhaar Extraction API provided by Signzy.
            </strong>}

            {/* Front Document Upload */}
            {!isDocumentsSubmitted && (
                <div>
                    <label>Upload Front of {kycType === 'aadhaar' ? 'Aadhaar' : 'PAN Card'}:</label>
                    <input type="file" accept="image/*,.pdf" onChange={handleFrontDocumentChange} />
                </div>
            )}

            {/* Back Document Upload */}
            {!isDocumentsSubmitted && (
                <div style={{ marginTop: '10px' }}>
                    <label>Upload Back of {kycType === 'aadhaar' ? 'Aadhaar' : 'PAN Card'}:</label>
                    <input type="file" accept="image/*,.pdf" onChange={handleBackDocumentChange} />
                </div>
            )}

            {/* Submit Button for Documents */}
            {!isDocumentsSubmitted && (
                <button style={{ marginTop: '20px' }} onClick={handleSubmitDocuments}>
                    {isUploading ? 'Uploading...' : 'Submit KYC Documents'}
                </button>
            )}

            {/* After Documents Submitted, Show Selfie Options */}
            {isDocumentsSubmitted && (
                <div style={{ marginTop: '20px' }}>
                    <h4>Choose Selfie Option</h4>
                    <button onClick={() => setSelfieOption('webcam')}>Take Selfie using Webcam</button>
                    <button onClick={() => setSelfieOption('upload')}>Upload Selfie Image</button>
                </div>
            )}

            {/* Webcam capture option */}
            {selfieOption === 'webcam' && !selfieCaptured && (
                <div style={{ marginTop: '20px' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/png"
                        videoConstraints={{ facingMode: 'user' }}
                    />
                    <button onClick={handleSelfieCapture}>Capture Selfie</button>
                </div>
            )}

            {/* File upload option */}
            {selfieOption === 'upload' && !selfieCaptured && (
                <div style={{ marginTop: '20px' }}>
                    <label>Upload Selfie:</label>
                    <input type="file" accept="image/*" onChange={handleSelfieFileChange} />
                </div>
            )}

            {/* Selfie confirmation message */}
            {selfieCaptured && (
                <div style={{ marginTop: '10px', color: 'green' }}>
                    ✅ Selfie Captured/Uploaded Successfully
                </div>
            )}

            {/* Submit button for Selfie */}
            {selfieCaptured && (
                <button style={{ marginTop: '20px' }} onClick={handleSubmitSelfie}>
                    {isUploading ? 'Uploading...' : 'Submit Selfie'}
                </button>
            )}

            {/* Back button */}
            <button style={{ marginTop: '20px' }} onClick={resetKycType}>Back</button>

            {/* Dialog with results */}
            {dialogOpen && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    border: '1px solid #ccc',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000,
                    color: 'black' // Set text color to black
                }}>
                    <h4>{dialogContent.uploadKycDataResult ? 'KYC Data' : 'Face Match Result'}</h4>
                    {dialogContent.uploadKycDataResult && (
                        <div>
                            <h5>Document Upload Result</h5>
                            <p><strong>Name:</strong> {dialogContent.uploadKycDataResult.result.name}</p>
                            <p><strong>Date of Birth:</strong> {dialogContent.uploadKycDataResult.result.dob}</p>
                            <p><strong>UID:</strong> {dialogContent.uploadKycDataResult.result.uid}</p>
                            <p><strong>Address:</strong> {dialogContent.uploadKycDataResult.result.address}</p>
                            <p><strong>Pincode:</strong> {dialogContent.uploadKycDataResult.result.pincode}</p>
                            <p><strong>Gender:</strong> {dialogContent.uploadKycDataResult.result.gender}</p>
                            <p><strong>validBackAndFront:</strong> {dialogContent.uploadKycDataResult.result.validBackAndFront.toString()}</p>
                            {/* Add more fields as necessary */}
                        </div>
                    )}

                    {dialogContent.faceMatchResult && (
                        <div>
                            <h5>Face Match Result</h5>
                            <p><strong>Verification:</strong> {dialogContent.faceMatchResult.verified ? 'Verified' : 'Not Verified'}</p>
                            <p><strong>Match Percentage:</strong> {dialogContent.faceMatchResult.matchPercentage}</p>
                        </div>
                    )}

                    <button onClick={dialogContent.faceMatchResult ?()=> resetKycType() :closeDialog}>Close</button>
                </div>
            )}
        </div>
    );
};

export default KYCForm;
