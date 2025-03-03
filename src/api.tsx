import axios from "axios";

export const uploadKycData = async ( formData) => {
    try {
        const response = await axios.post('signzy-kyc-demo-le4f-5bnoh7om9-umars-projects-efb18afc.vercel.app/aadhaar/extraction', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',  // For file uploads
            },
        });

        console.log('Aadhaar extraction result:', response.data);
        return response.data;  // Assuming your API returns a message
    } catch (error) {
        // alert('Invlaid Adhaar')
        return {error:'Invalid'}
        console.error('Error during Aadhaar extraction:', error);
    }
};

export const faceMatch = async (data)=>{
    try {
        const response = await axios.post('signzy-kyc-demo-le4f-5bnoh7om9-umars-projects-efb18afc.vercel.app/facematch', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('facematch result:', response.data);
        return response.data;  // Assuming you
    } catch (error) {
        console.error('face match data error', error);
    }
}


// Simulated API call (replace with your actual API endpoint)
    // return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         console.log('KYC Data:', Object.fromEntries(formData));
    //         resolve({ message: 'KYC Data Uploaded Successfully!' });
    //     }, 1000);
    // });