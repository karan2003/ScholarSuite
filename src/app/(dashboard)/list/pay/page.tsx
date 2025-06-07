// import React, { useEffect } from 'react';

// declare global {
//     interface Window {
//         Razorpay: any; // Declaring Razorpay on the Window object
//     }
// }

// interface PaymentFormProps {
//     amount: number;
// }

// const PaymentForm: React.FC<PaymentFormProps> = ({ amount }) => {
//     useEffect(() => {
//         // Load the Razorpay script dynamically
//         const script = document.createElement('script');
//         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//         script.async = true;
//         document.body.appendChild(script);

//         script.onload = () => {
//             if (window.Razorpay) {
//                 const options = {
//                     key: 'rzp_live_gVdm3WGlpr0Nq', // Your Razorpay API Key
//                     amount: amount * 100, // Convert to paisa
//                     currency: 'INR',
//                     name: 'Diagnostics Center',
//                     description: 'Payment for Diagnostics Tests',
//                     handler: function (response: any) {
//                         // This function is called when the payment is successful
//                         // You would typically send this response to your backend for verification
//                         console.log('Payment successful:', response);
//                         // Redirect or update UI based on success
//                         window.location.href = /payment_success?payment_id=${response.razorpay_payment_id};
//                     },
//                     prefill: {
//                         name: 'User', // You can dynamically get user name
//                         email: 'user@example.com' // You can dynamically get user email
//                     },
//                     theme: {
//                         color: '#3399cc'
//                     }
//                 };

//                 const rzp1 = new window.Razorpay(options);
//                 rzp1.open();
//             }
//         };

//         return () => {
//             // Clean up the script when the component unmounts
//             const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
//             if (existingScript) {
//                 existingScript.remove();
//             }
//         };
//     }, [amount]); // Re-run effect if amount changes

//     return (
//         <div>
//             <h2>Processing Payment...</h2>
//             <p>Please wait while we redirect you to the payment gateway.</p>
//         </div>
//     );
// };

// export default PaymentForm;