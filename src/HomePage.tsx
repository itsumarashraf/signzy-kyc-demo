import  { useState } from 'react';
import KYCForm from './KYCForm';

const HomePage = () => {
    const [kycType, setKycType] = useState<any>(null);

    return (
        <div>
            {!kycType ? (
                <div>
                    <h3>Select KYC Verification Type</h3>
                    <button onClick={() => setKycType('aadhaar')}>Aadhaar Verification</button>
                    <button onClick={() => setKycType('pan')}>PAN Card Verification</button>
                </div>
            ) : (
                <KYCForm kycType={kycType} resetKycType={() => setKycType(null)} />
            )}
        </div>
    );
};

export default HomePage;
