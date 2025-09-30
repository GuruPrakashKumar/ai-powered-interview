// src/components/ProgressModal.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

export default function ProgressModal() {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('instructions');
  const candidate = useSelector((state) => state.chat.candidate);
  const interview = useSelector((state) => state.interview);
  const chatMessages = useSelector((state) => state.chat.messages || []);

  useEffect(() => {
    const isInitialState = !candidate.resumeUploaded && 
                          chatMessages.length <= 1 && 
                          chatMessages.every(msg => msg.sender === 'system');

    const isReturningToInterview = candidate.resumeUploaded && 
                                  interview.status === 'running' &&
                                  interview.currentIndex >= 1 &&
                                  !isInitialState;
    if (isInitialState) {
      setModalType('instructions');
      setShowModal(true);
    } else if (isReturningToInterview) {
      setModalType('welcomeBack');
      setShowModal(true);
      
      const timer = setTimeout(() => {
        setShowModal(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [candidate.resumeUploaded, interview.status]);

  const handleClose = () => {
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Instructions Modal */}
        {modalType === 'instructions' && (
          <>
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Welcome to Your AI Interview!</h3>
            </div>
            
            <div className="space-y-3 mb-4">
              <p className="text-gray-600">
                Get ready for your technical interview. Here's what to expect:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mt-1 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Upload your resume to start</span>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mt-1 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Complete any missing profile information</span>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mt-1 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Answer 6 technical questions (2 Easy, 2 Medium, 2 Hard)</span>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mt-1 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Timed questions: Easy (20s), Medium (60s), Hard (120s)</span>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-green-100 p-1 rounded-full mt-1 mr-3">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700 text-sm">Your progress is automatically saved</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-blue-800">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Don't worry if you close the browser - your progress will be saved!
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Get Started
            </button>
          </>
        )}

        {/* Welcome Back Modal */}
        {modalType === 'welcomeBack' && (
          <>
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-2 rounded-full mr-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Welcome Back!</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Don't worry, your interview progress has been saved. You can continue from where you left off.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center text-sm text-blue-800">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Current Status: Interview in Progress
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Continue Interview
            </button>
          </>
        )}
      </div>
    </div>
  );
}